module.exports = {

    //Identificador da Requisição
    NONCE: 1,

    // 'true' = Documento original em qualquer formato
    // 'false' = Documento original em formato xml.
    BINARY_CONTENT: 'false',

    // Valores disponíveis: "BASIC", "CHAIN", "CHAIN_CRL", "TIMESTAMP", "COMPLETE"
    // "ADRB", "ADRT", "ADRV", "ADRC", "ADRA", "ETSI_B", "ETSI_T" , "ETSI_LT" e "ETSI_LTA".
    PROFILE: 'BASIC',

    // Valores disponíveis: ENVELOPED = a assinatura está contida no conteúdo do documento
    // ENVELOPING = a assinatura contém o conteúdo do documento
    // DETACHED= a assinatura e o conteúdo do documento estão separados
    SIGNATURE_FORMAT: 'ENVELOPED',

    // Valores Disponíveis : "SHA1", "SHA256" e "SHA512".
    HASH_ALGORITHM: 'SHA256',

    // Operações disponíveis: "SIGNATURE", "CO_SIGNATURE" e "COUNTER_SIGNATURE".
    OPERATION_TYPE: 'SIGNATURE',

    // Identificador do documento original dentro de um lote
    NONCE_OF_ORIGINAL_DOCUMENT: 1,

    //local onde o documento original está armazenado
    ORIGINAL_DOCUMENT_PATH: './arquivo-assinar/template.xml'

}