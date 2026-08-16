import QRCode from 'qrcode';

function crc16(str: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;
  const bytes = Buffer.from(str, 'utf-8');

  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i] << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatEmvField(id: string, value: string): string {
  const len = Buffer.byteLength(value, 'utf-8').toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export interface PixPayloadOptions {
  pixKey: string;
  beneficiaryName: string;
  city: string;
  amount: number;
  txId: string;
  description?: string;
}

export function generatePixCopyPaste(options: PixPayloadOptions): string {
  const { pixKey, beneficiaryName, city, amount, txId, description } = options;

  // Merchant Account Info (ID 26)
  const gui = formatEmvField('00', 'br.gov.bcb.pix');
  const key = formatEmvField('01', pixKey);
  const desc = description ? formatEmvField('02', description.substring(0, 25)) : '';
  const merchantAccountInfo = formatEmvField('26', `${gui}${key}${desc}`);

  // General Fields
  const payloadFormat = formatEmvField('00', '01');
  const merchantCategory = formatEmvField('52', '0000');
  const currency = formatEmvField('53', '986'); // BRL
  const formattedAmount = formatEmvField('54', amount.toFixed(2));
  const countryCode = formatEmvField('58', 'BR');
  const cleanName = beneficiaryName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 25).toUpperCase();
  const cleanCity = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 15).toUpperCase();
  const nameField = formatEmvField('59', cleanName || 'CYBER MUSIC');
  const cityField = formatEmvField('60', cleanCity || 'SAO PAULO');

  // Additional Data (ID 62)
  const cleanTxId = txId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || '***';
  const txField = formatEmvField('05', cleanTxId);
  const additionalData = formatEmvField('62', txField);

  // Partial raw payload before CRC
  const rawPayload = `${payloadFormat}${merchantAccountInfo}${merchantCategory}${currency}${formattedAmount}${countryCode}${nameField}${cityField}${additionalData}6304`;

  const checksum = crc16(rawPayload);
  return `${rawPayload}${checksum}`;
}

export async function generatePixQrCodeDataUrl(copyPasteCode: string): Promise<string> {
  try {
    return await QRCode.toDataURL(copyPasteCode, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 8,
      color: {
        dark: '#00f0ff',
        light: '#07080c',
      },
    });
  } catch (err) {
    console.error('Failed to generate PIX QR Code image:', err);
    return '';
  }
}
