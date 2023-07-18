const request = require("request");
const { Base64Binary } = require("../functions/Base64Decoder");
const serviceConfig = require("../config/ServiceConfig");
const signatureConfig = require("../config/SignatureConfig");
const {
  cipher,
  getPublicKey,
  setPublicAndPrivateKey,
} = require("../functions/Cipher");
require("dotenv").config();
var fs = require("fs");

this.headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${serviceConfig.ACCESS_TOKEN}`,
};

var auxAuthorization = this.headers.Authorization.split(" ");

if (auxAuthorization[1] === `<${process.env.KEY}>`) {
  console.log("Set up a valid token");
  return;
}

setPublicAndPrivateKey();

const urlInicialization = serviceConfig.URL_INITIALIZE_SIGNATURE;
const urlFinalization = serviceConfig.URL_FINALIZE_SIGNATURE;

const initializeSignature = (URL) => {
  const formInicialization = {
    nonce: signatureConfig.NONCE,
    binaryContent: signatureConfig.BINARY_CONTENT,
    profile: signatureConfig.PROFILE,
    signatureFormat: signatureConfig.SIGNATURE_FORMAT,
    hashAlgorithm: signatureConfig.HASH_ALGORITHM,
    certificate: getPublicKey(),
    operationType: signatureConfig.OPERATION_TYPE,
    "originalDocuments[0][nonce]": signatureConfig.NONCE_OF_ORIGINAL_DOCUMENT,
    "originalDocuments[0][content]": fs.createReadStream(
      signatureConfig.ORIGINAL_DOCUMENT_PATH
    ),
  };

  return new Promise((resolve, reject) => {
    request.post(
      { url: URL, formData: formInicialization, headers: this.headers },
      (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(body));
        }
      }
    );
  });
};

const finalizeSignature = (URL_FINALIZATION, formFinalization) => {
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: URL_FINALIZATION,
        formData: formFinalization,
        headers: this.headers,
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(body));
        }
      }
    );
  });
};

initializeSignature(urlInicialization)
  .then((result) => {
    console.log("Result of initialization: \n", result);

    var signedAttributes = result.signedAttributes;
    var initializedDocuments = result.initializedDocuments;

    var messageDigest;
    var messageDigestEncryptedAndBase64encoded;
    var signedAttributesArray;
    var nonceOfSignedAttributes;

    const formFinalization = {
      nonce: signatureConfig.NONCE,
      binaryContent: signatureConfig.BINARY_CONTENT,
      profile: signatureConfig.PROFILE,
      signatureFormat: signatureConfig.SIGNATURE_FORMAT,
      hashAlgorithm: signatureConfig.HASH_ALGORITHM,
      certificate: getPublicKey(),
      operationType: signatureConfig.OPERATION_TYPE,
    };

    for (var i = 0; i < signedAttributes.length; i++) {
      signedAttributesArray = signedAttributes[i];
      nonceOfSignedAttributes = signedAttributesArray.nonce;
      signedAttributesContent = signedAttributesArray.content;
      initializedDocument = initializedDocuments[i].content;

      var byteArray = Base64Binary.decode(signedAttributesContent);

      // Será necessário criptografar com uma chave privada (correspondente ao certificado informado na etapa de inicialização da assinatura) o valor armazenado na variável messageDigest e codificá-lo em base64

      signedAttributesContentEncryptedAndBase64encoded = cipher(
        Buffer.from(byteArray, "binary").toString("hex")
      );

      formFinalization["finalizations[0][nonce]"] = nonceOfSignedAttributes;
      formFinalization["finalizations[0][initializedDocument]"] =
        initializedDocument;
      formFinalization["finalizations[0][signatureValue]"] =
        signedAttributesContentEncryptedAndBase64encoded;
      formFinalization["finalizations[0][document]"] = fs.createReadStream(
        signatureConfig.ORIGINAL_DOCUMENT_PATH
      );
    }

    finalizeSignature(urlFinalization, formFinalization)
      .then((result) => {
        console.log("\nFinalizando:\n", result);

        var signaturesArray = result.signatures;

        var contentOfSignature = signaturesArray[0].content;

        var byteArray = Base64Binary.decode(contentOfSignature);

        fs.appendFile("DocumentoAssinado.xml", byteArray, function (err) {
          if (err) throw err;
          console.log(
            "\nAssinatura Criada com sucesso em: DocumentoAssinado.xml"
          );
        });
      })
      .catch((error) => {
        console.log(error);
      });
  })
  .catch((error) => {
    console.log(error);
  });
