import Iyzipay from 'iyzipay'

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || '',
    secretKey: process.env.IYZICO_SECRET_KEY || '',
    uri: process.env.IYZICO_URL || 'https://sandbox-api.iyzipay.com'
})

export default iyzipay