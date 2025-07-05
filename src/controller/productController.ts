import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import { NextFunction, Request, Response } from "express";
import { supabaseSecret } from "../config/supabaseConfig";
import {uploadImageToSupabase, deleteImageFromSupabase} from '../utils/uploadImage'
// import { UploadedFile } from "express-fileupload";

// interface CustomRequest extends Request {
//   files?: { image?: UploadedFile };
// }



export const getAllProducts = catchAsync(async (req:Request, res:Response, next:NextFunction)=>{

    const {data:productData, error:productError} = await supabaseSecret
    .from('products')
    .select('*')

    if(productError){
        return next(new AppError(productError.message, 400))
    }

    res.status(200).json({
        status:"success",
        data: productData
    })
})

export const createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, price, size, category, age, health_status } = req.body;

  // 1. Check required fields first
  if (!title || !price || !category || !age || !health_status || !size) {
    return next(new AppError("Missing required product fields", 400));
  }

  // 2. Then check and handle file upload
  const file = req.files?.image;
  if (!file) {
    return next(new AppError("Product image is required", 400));
  }

  const imageFile = Array.isArray(file) ? file[0] : file;
  const bucketName = "product.images";

  let uploadedImage;
  try {
    uploadedImage = await uploadImageToSupabase(imageFile, bucketName);
  } catch (uploadErr) {
    return next(uploadErr);
  }

  // 3. Insert product
  const { data, error } = await supabaseSecret
    .from("products")
    .insert([
      {
        title,
        description,
        price: parseFloat(price),
        size,
        category,
        age: parseInt(age),
        health_status,
        image_url: uploadedImage.publicUrl,
        image_path: uploadedImage.path,
      },
    ])
    .select()
    .single();

  if (error) {
    await deleteImageFromSupabase(uploadedImage.path, bucketName);
    return next(new AppError(error.message, 500));
  }

  res.status(201).json({
    status: "success",
    data,
  });
});

export const updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Product ID is required for update', 400));
  }

  // 1. Get the existing product
  const { data: existingProduct, error: fetchError } = await supabaseSecret
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingProduct) {
    return next(new AppError('Product not found', 404));
  }

  let image_url = existingProduct.image_url;
  let image_path = existingProduct.image_path;
  let bucketName = 'product.images';

  const file = req.files?.image

  // 2. If a new image is provided
  if (file) {
    try {
        const imageFile = Array.isArray(file) ? file[0] : file;


        // Delete old image
        await deleteImageFromSupabase(image_path, bucketName);

        // Upload new image
        const { publicUrl, path } = await uploadImageToSupabase(
            imageFile,
            bucketName
        );

        image_url = publicUrl;
        image_path = path;
    } catch (imgErr: any) {
    return next(new AppError(`Image update failed: ${imgErr.message}`, 500));
    }
  }

  // 3. Prepare updated fields
  const {
    title = existingProduct.title,
    description = existingProduct.description,
    price = existingProduct.price,
    size = existingProduct.size,
    category = existingProduct.category,
    age = existingProduct.age,
    health_status = existingProduct.health_status,
  } = req.body;

  // 4. Update product
  const { error: updateError } = await supabaseSecret
    .from('products')
    .update({
      title,
      description,
      price: parseFloat(price),
      size,
      category,
      age: parseInt(age),
      health_status,
      image_url,
      image_path,
    })
    .eq('id', id);

  if (updateError) {
    return next(new AppError(updateError.message, 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Product updated successfully',
  });
});


export const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const bucketName = "product.images";

  if (!id) {
    return next(new AppError("Product ID is required", 400));
  }

  // Step 1: Get the product by ID to get image_path
  const { data: product, error: fetchError } = await supabaseSecret
    .from("products")
    .select("image_path")
    .eq("id", id)
    .single();

  if (fetchError || !product) {
    return next(new AppError("Product not found", 404));
  }

  // Step 2: Delete image from Supabase storage
  if (product.image_path) {
    try {
      await deleteImageFromSupabase(product.image_path, bucketName);
    } catch (imgErr:any) {
      return next(new AppError(`Failed to delete product image: ${imgErr.message}`, 500));
    }
  }

  // Step 3: Delete product from DB
  const { error: deleteError } = await supabaseSecret
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return next(new AppError(`Failed to delete product: ${deleteError.message}`, 500));
  }

  res.status(200).json({
    status: "success",
    message: "Product deleted successfully",
  });
});