<template>
  <div>
    <h1>Payment Page</h1>
    <bullring-payment-widget
      :merchant-id="merchantId"
      :merchant-name="merchantName"
      :invoice-amount="100" 
      @payment-success="handlePaymentSuccess"
      @payment-error="handlePaymentError"
      @close="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
import '@bullring/payment-widget/dist';
import '@bullring/payment-widget/dist/styles.css';

const merchantId = 'e6095fa1-4d03-4d6b-8fa8-e77009484a6e';
const merchantName = 'Test Store';

const handlePaymentSuccess = (data: any) => {
  console.log('Payment successful:', data);
};

const handlePaymentError = (error: Error) => {
  console.error('Payment failed:', error);
};

const handleClose = (txId: string) => {
  console.log('Widget closed, transaction ID:', txId);
};
</script>

<style>
/* Any styles you need */
</style>