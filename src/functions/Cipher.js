var forge = require('node-forge');
var KJUR = require('jsrsasign')
var fs = require('fs');
const certificateConfig = require('../config/CertificateConfig');
const signatureConfig = require('../config/SignatureConfig');

var privateKey;
var publicKey;

function setPublicAndPrivateKey() {
    console.log('Configurando chave pública e privada...\n');

    var p12Asn1 = forge.asn1.fromDer(
        fs.readFileSync(certificateConfig.PRIVATE_KEY_LOCATION, 'binary'));

    var pkcs12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, certificateConfig.PRIVATE_KEY_PASSWORD);

    //Em seguida, obtenha a chave privada do pkcs12 do certificado desejado (consulte o forge doc) e converta para PKCS # 8 para ser importado com webcrypto
    for (var sci = 0; sci < pkcs12.safeContents.length; ++sci) {
        var safeContents = pkcs12.safeContents[sci];

        for (var sbi = 0; sbi < safeContents.safeBags.length; ++sbi) {
            var safeBag = safeContents.safeBags[sbi];

            if (safeBag.cert != undefined) {
                // Certificado de codificação DER e, em seguida, codificação base64 que
                var der = forge.asn1.toDer(forge.pki.certificateToAsn1(safeBag.cert));
                var b64 = forge.util.encode64(der.getBytes());

                this.publicKey = b64;
            }


            if (safeBag.type === forge.pki.oids.keyBag) {
              
                privateKey = safeBag.key;
            } else if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
               
                privateKey = safeBag.key;
            } else if (safeBag.type === forge.pki.oids.certBag) {
               
            }
        }
    }
}

function getPublicKey() {
    return this.publicKey;
}

// Converte uma string hexadecimal em um array de bytes
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

const cipher = (messageDigest) => {

    var pki = forge.pki;

    // envolve um objeto RSAPrivateKey ASN.1 em um PKCS#8 ASN.1 PrivateKeyInfo
    var privateKeyInfo = pki.wrapRsaPrivateKey(pki.privateKeyToAsn1(privateKey));

    // converter um PKCS#8 ASN.1 PrivateKeyInfo para PEM
    var pem = pki.privateKeyInfoToPem(privateKeyInfo)

    var hashAlgorithm = signatureConfig.HASH_ALGORITHM + 'withRSA';

    var sig = new KJUR.crypto.Signature({ "alg": hashAlgorithm });

    sig.init(pem);
    sig.updateHex(messageDigest);
    var signedData = sig.sign();

    var signedDataInBinary = hexToBytes(signedData);


    return Buffer.from(signedDataInBinary, 'binary').toString('base64');
}

module.exports = { cipher, getPublicKey, setPublicAndPrivateKey };