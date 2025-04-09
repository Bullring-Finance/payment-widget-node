import i18next from 'i18next';
import { LucideIcons } from './icons/icons';
import { PaymentResponse, Profile } from './types/payment';
import { formatAmountIntl } from './utils/formatters';
import { getBaseUrl } from './utils/api';
import QRCode from 'qrcode';
import enTranslations from './locales/en';
import ptTranslations from './locales/pt';

const template = document.createElement('template');
template.innerHTML = `
 <style>
    @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
  </style>
  <style>
    :host {
      @apply fixed inset-0 z-50;
    }
    .overlay {
      @apply absolute inset-0 bg-black/25;
    }
    .container {
      @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-auto rounded-lg shadow-lg p-6 bg-white text-gray-900;
    }
    .header {
      @apply flex items-center justify-between mb-4;
    }
    .title {
      @apply text-lg opacity-75 text-center w-full;
    }
    .amount {
      @apply text-center mb-6;
    }
    .amount-value {
      @apply text-2xl font-bold;
    }
    .qr-container {
      @apply bg-white p-4 rounded-lg mb-4;
    }
    .qr-code {
      @apply h-64 flex items-center justify-center border mx-auto;
      width: 250px;
      height: 250px;
      max-width: 100%;
      border-radius: 10px;
    }
    .invoice-container {
      @apply border border-dashed border-slate-700 rounded-xl p-1 flex items-center justify-between;
    }
    .invoice-details {
      @apply flex flex-col items-start;
    }
    .invoice-label {
      @apply text-base mb-1 pl-3;
    }
    .invoice-value {
      @apply text-slate-400 text-sm truncate w-48 pl-3;
    }
    .copy-button {
      @apply bg-white p-2 rounded-xl hover:bg-slate-200 hover:border-transparent;
    }
    .close-button {
      @apply w-full py-4 bg-gray-100 rounded-xl my-4 text-gray-900;
    }
    .footer {
      @apply mt-8 text-center text-sm text-slate-400;
    }
    .powered-by {
      @apply flex items-center justify-center gap-2;
    }
    .logo {
      @apply h-6;
    }
        .payment-widget {
      position: fixed;
      inset: 0;
      z-index: 50;
      width: 100%;
      height: 100%;
    }
    
    .overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.25);
      width: 100%;
      height: 100%;
    }
    
    .container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      max-width: 24rem;
      margin: 0 auto;
      background-color: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .title {
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    .amount {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    
    .qr-container {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: center;
    }
    
    .qr-code {
      width: 250px;
      height: 250px;
      max-width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .invoice-container {
      border: 1px dashed #64748b;
      border-radius: 0.75rem;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    
    .close-button {
      width: 100%;
      padding: 1rem;
      background-color: #f3f4f6;
      border-radius: 0.75rem;
      margin: 1rem 0;
      color: rgb(17, 24, 39);
      cursor: pointer;
    }

    .close-button:hover {
      background-color: #e5e7eb;
    }
  </style>
  <div class="payment-widget">
    <div class="overlay"></div>
    <div class="container">
      <!-- Content will be dynamically inserted here -->
    </div>
  </div>
`;

class BullringPaymentWidget extends HTMLElement {
  private shadow: ShadowRoot;
  private invoice: string = '';
  private invoiceId: string = '';
  private amount: number = 0;
  private merchantId: string = '';
  private merchantName: string = '';
  private paymentStatus: 'idle' | 'pending' | 'success' | 'error' = 'idle';
  private profile: Profile | null = null;
  private isLoading: boolean = true;
  private error: Error | null = null;

  static get observedAttributes() {
    return ['amount', 'merchant-id', 'merchant-name', 'invoice-amount'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    this.initializeI18n();
  }

  private async initializeI18n() {
    await i18next.init({
      resources: {
        en: { translation: enTranslations },
        pt: { translation: ptTranslations },
      },
      lng: navigator.language,
      fallbackLng: 'en',
    });
  }

  connectedCallback() {
    this.setupAttributes();
    this.fetchStoreProfile();
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      switch (name) {
        case 'invoice-amount':
          this.amount = Number(newValue);
          break;
        case 'merchant-id':
          this.merchantId = newValue;
          break;
        case 'merchant-name':
          this.merchantName = newValue;
          break;
      }
      this.render();
    }
  }

  private setupAttributes() {
    this.amount = Number(this.getAttribute('invoice-amount')) || 0;
    this.merchantId = this.getAttribute('merchant-id') || '';
    this.merchantName = this.getAttribute('merchant-name') || '';
  }

  private async fetchStoreProfile() {
    try {
      const response = await fetch(`${getBaseUrl(this.merchantId)}/stores/${this.merchantId}/widget`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: Profile = await response.json();
      this.profile = data;
      this.generateInvoice();
    } catch (error) {
      this.handleError(error);
    }
  }

  private async generateInvoice() {

    if (!this.amount || !this.merchantId || !this.profile?.preferredCurrency) {
      this.handleError(new Error('Invalid parameters'));
      return;
    }

    try {
      const response = await fetch(
        `${getBaseUrl(this.merchantId)}/stores/${this.merchantId}/invoices/widget`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: this.amount,
            currency: this?.profile?.preferredCurrency,
          }),
        }
      );

      const data: PaymentResponse = await response.json();
      this.invoice = data.lightningInvoice;
      this.invoiceId = data.id;
      this.isLoading = false;
      this.render();
      this.startPaymentCheck();
    } catch (error) {
      this.handleError(error);
    }
  }

  private startPaymentCheck() {
    const checkInterval = setInterval(async () => {
      if (this.paymentStatus === 'success') {
        clearInterval(checkInterval);
        return;
      }

      try {
        const response = await fetch(
          `${getBaseUrl(this.merchantId)}/stores/${this.merchantId}/invoices/${this.invoiceId}/status`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data: PaymentResponse = await response.json();
        if (data.status === 'paid') {
          this.paymentStatus = 'success';
          this.dispatchEvent(new CustomEvent('payment-success', { detail: data }));
          this.render();
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
      }
    }, 2000);
  }

  private handleError(error: any) {
    this.error = error instanceof Error ? error : new Error('Unknown error');
    this.isLoading = false;
    this.dispatchEvent(new CustomEvent('payment-error', { detail: this.error }));
    this.render();
  }

  private async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  private closeModal() {
    console.log('Closing modal');
    this.dispatchEvent(new CustomEvent('close', { detail: this.invoiceId }));
    this.dispatchEvent(new CustomEvent('payment-close', { detail: this.invoiceId }));
    // this.remove();
    // this.render();
  }

  private renderLoading() {
    return `
      <div class="flex items-center justify-center space-x-2 text-black">
        ${LucideIcons.refreshCw({ className: 'w-6 h-6 animate-spin text-black' })}
        <span>${i18next.t('payment.loading')}</span>
      </div>
    `;
  }

  private renderSuccess() {
    return `
      <div class="success-content">
        ${LucideIcons.checkCircle({ className: 'w-16 h-16 mx-auto mb-4 text-green-500 stroke-2' })}
        <div class="bg-gray-50 rounded-2xl p-6">
          <div class="flex justify-start mb-4 items-center">
            <p class="text-gray-500 mr-1">${i18next.t('payment.amount')}: </p>
            <p class="text-gray-900 text-sm truncate mt-1">
              ${formatAmountIntl(this.amount, this.profile?.preferredCurrency || '')}
            </p>
          </div>
          <div class="flex justify-start items-center">
            <p class="text-gray-500 mr-1">${i18next.t('payment.id')}: </p>
            <p class="text-gray-900 text-sm truncate mt-1">${this.invoiceId}</p>
          </div>
        </div>
        <button class="close-button" @click="${() => this.closeModal()}">
          ${i18next.t('payment.close')}
        </button>
      </div>
    `;
  }

  private async generateQRWithLogo(): Promise<string> {
    const canvas = new OffscreenCanvas(220, 220);
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    try {
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(this.invoice, {
        width: 220,
        margin: 0,
        errorCorrectionLevel: 'H',
        version: 20,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      });

      // Create a bitmap from QR code
      const qrImage = await createImageBitmap(await (await fetch(qrDataUrl)).blob());
      ctx.drawImage(qrImage, 0, 0);

      // Load high quality logo (requesting a larger size from Cloudinary)
      // Load high quality logo with specific Cloudinary transformations
      const logoResponse = await fetch(
        "https://res.cloudinary.com/bullring-finance/image/upload/v1744176738/icon_wspqla.png"
      );
      const logoBlob = await logoResponse.blob();
      const logoImage = await createImageBitmap(logoBlob);

      // Calculate center position
      const logoSize = 40;
      const padding = 3;
      const totalSize = logoSize + (padding * 2);
      const logoX = (220 - totalSize) / 2;
      const logoY = (220 - totalSize) / 2;

      // Draw white background
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      const radius = 10;

      // Draw rounded rectangle for white background
      ctx.moveTo(logoX + radius, logoY);
      ctx.lineTo(logoX + totalSize - radius, logoY);
      ctx.arcTo(logoX + totalSize, logoY, logoX + totalSize, logoY + radius, radius);
      ctx.lineTo(logoX + totalSize, logoY + totalSize - radius);
      ctx.arcTo(logoX + totalSize, logoY + totalSize, logoX + totalSize - radius, logoY + totalSize, radius);
      ctx.lineTo(logoX + radius, logoY + totalSize);
      ctx.arcTo(logoX, logoY + totalSize, logoX, logoY + totalSize - radius, radius);
      ctx.lineTo(logoX, logoY + radius);
      ctx.arcTo(logoX, logoY, logoX + radius, logoY, radius);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Create clipping path for the logo with rounded corners
      ctx.save();
      ctx.beginPath();
      const logoRadius = 10; // Radius for the logo itself
      const logoStartX = logoX + padding;
      const logoStartY = logoY + padding;

      // Draw rounded rectangle path for logo clipping
      ctx.moveTo(logoStartX + logoRadius, logoStartY);
      ctx.lineTo(logoStartX + logoSize - logoRadius, logoStartY);
      ctx.arcTo(logoStartX + logoSize, logoStartY, logoStartX + logoSize, logoStartY + logoRadius, logoRadius);
      ctx.lineTo(logoStartX + logoSize, logoStartY + logoSize - logoRadius);
      ctx.arcTo(logoStartX + logoSize, logoStartY + logoSize, logoStartX + logoSize - logoRadius, logoStartY + logoSize, logoRadius);
      ctx.lineTo(logoStartX + logoRadius, logoStartY + logoSize);
      ctx.arcTo(logoStartX, logoStartY + logoSize, logoStartX, logoStartY + logoSize - logoRadius, logoRadius);
      ctx.lineTo(logoStartX, logoStartY + logoRadius);
      ctx.arcTo(logoStartX, logoStartY, logoStartX + logoRadius, logoStartY, logoRadius);
      ctx.closePath();
      ctx.clip();

      // Draw the logo
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        logoImage,
        logoX + padding,
        logoY + padding,
        logoSize,
        logoSize
      );
      ctx.restore();

      // Convert to blob and then to data URL
      const blob = await canvas.convertToBlob({ type: 'image/png', quality: 1.0 });
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error('Error generating QR code with logo:', error);
      return QRCode.toDataURL(this.invoice, {
        width: 220,
        margin: 0
      });
    }
  }
  private async render() {
    const container = this.shadow.querySelector('.container');
    if (!container) return;

    if (this.isLoading) {
      container.innerHTML = this.renderLoading();
      const copyButton = container.querySelector('.copy-button');
      if (copyButton) {
        copyButton.addEventListener('click', () => this.copyToClipboard(this.invoice));
      }

      const closeButton = container.querySelector('.close-button');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.closeModal());
      }
      return;
    }

    if (this.error) {
      container.innerHTML = `
        <div class="error-content text-black">
          ${LucideIcons.xCircle({ className: 'w-16 h-16 mx-auto mb-4 text-red-500 stroke-2 text-black' })}
          <p class=" text-center text-black">${i18next.t('payment.error')}</p>
          <div class="bg-gray-50 rounded-2xl p-6 mt-4 text-black">
            <p class="text-red-500">${this.error.message}</p>
          </div>
          <button class="close-button" @click="${() => this.closeModal()}">
            ${i18next.t('payment.retry')}
          </button>
        </div>
      `;
      const copyButton = container.querySelector('.copy-button');
      if (copyButton) {
        copyButton.addEventListener('click', () => this.copyToClipboard(this.invoice));
      }

      const closeButton = container.querySelector('.close-button');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.closeModal());
      }
      return;
    }

    if (this.paymentStatus === 'success') {
      container.innerHTML = this.renderSuccess();
      const copyButton = container.querySelector('.copy-button');
      if (copyButton) {
        copyButton.addEventListener('click', () => this.copyToClipboard(this.invoice));
      }

      const closeButton = container.querySelector('.close-button');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.closeModal());
      }
      return;
    }

    let qrCodeDataUrl = '';
    if (this.invoice) {
      qrCodeDataUrl = await this.generateQRWithLogo();
    }


    container.innerHTML = `
      <div class="flex items-center justify-center mb-4">
        <span class="title text-black">
          ${i18next.t('payment.title', { merchant: this.merchantName || this.profile?.name })}
        </span>
      </div>
      <div class="text-center mb-6">
        <div class="text-2xl font-bold text-black">
          ${formatAmountIntl(this.amount, this.profile?.preferredCurrency || '')}
        </div>
      </div>
      ${this.invoice ? `
        <div class="bg-white p-4 rounded-lg mb-4">
          <div class="h-64 flex items-center justify-center border mx-auto qr-code">
            <img src="${qrCodeDataUrl}" alt="QR Code" width="220" height="220" />
          </div>
        </div>
      ` : ''}
      <div class="invoice-container">
        <div class="invoice-details flex flex-col items-start">
          <p class="text-base mb-1 pl-3 invoice-label text-black">${i18next.t('payment.lightning')}</p>
          <p class="invoice-value text-sm truncate w-48 pl-3 text-black">${this.invoice || i18next.t('payment.noInvoice')}</p>
        </div>
        <button class="text-black bg-white p-2 rounded-xl hover:bg-gray-300 copy-button mr-2 " @click="${() => this.copyToClipboard(this.invoice)}">
          ${LucideIcons.copy({ size: 24 })}
        </button>
      </div>
      <button class="close-button text-black" @click="${() => this.closeModal()}">
        ${i18next.t('payment.close')}
      </button>
      <div class="mt-8 text-center text-sm text-slate-400 footer">
        <p class="flex items-center justify-center gap-2 powered-by text-black">
          ${i18next.t('payment.poweredBy')}
          <img src="https://res.cloudinary.com/bullring-finance/image/upload/v1737826118/Logo_bullring_1_u8f6gy.svg"
               alt="Bullring Finance Logo"
               class="h-6 logo" />
        </p>
      </div>
    `;

    const copyButton = container.querySelector('.copy-button');
    if (copyButton) {
      copyButton.addEventListener('click', () => this.copyToClipboard(this.invoice));
    }

    const closeButton = container.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeModal());
    }
  }
}

customElements.define('bullring-payment-widget', BullringPaymentWidget);