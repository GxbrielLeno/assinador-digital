require('dotenv').config()
module.exports = {

    URL_INITIALIZE_SIGNATURE: 'https://fw2.bry.com.br/api/xml-signature-service/v1/signatures/initialize',

    URL_FINALIZE_SIGNATURE: 'https://fw2.bry.com.br/api/xml-signature-service/v1/signatures/finalize',

    //Token de Acesso JWT da Bry
    ACCESS_TOKEN: `${process.env.KEY}`

}