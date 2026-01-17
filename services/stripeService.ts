
import { loadStripe } from '@stripe/stripe-js';

// The user-provided Live Stripe Publishable Key
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51PiX5oRCtDyI9E1sDwMKgUKYWOt31FwnXxojyJmh3StzYlg3z2xDJ1Cui5zmBXruoKYFf0BknceLvJMArpgHFAnU00bFOgGquN';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const stripeService = {
  /**
   * Formats a number into a currency string.
   * Strictly enforces British Pounds (GBP) as requested.
   */
  formatCurrency: (amount: number, currencyCode: string = 'GBP') => {
    try {
      // Forcing GBP as the primary currency
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(amount);
    } catch (e) {
      return `£${amount.toFixed(2)}`;
    }
  },

  /**
   * Simulated API call to create a Stripe PaymentIntent.
   * Strictly uses GBP as the default transaction currency.
   */
  initiateStripeCheckout: async (amount: number, currency: string = 'GBP') => {
    // Ensuring the transaction currency is strictly GBP
    const checkoutCurrency = 'GBP';
    
    // Simulation of network delay and authorization logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      transactionId: `txn_${Math.random().toString(36).substring(7).toUpperCase()}`,
      currency: checkoutCurrency,
      amount: amount,
      gateway: 'Stripe Connect'
    };
  }
};
