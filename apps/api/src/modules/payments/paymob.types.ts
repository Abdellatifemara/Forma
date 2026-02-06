/**
 * Paymob API Types
 * Documentation: https://docs.paymob.com/
 */

export interface PaymobAuthResponse {
  token: string;
  profile: {
    id: number;
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
    };
  };
}

export interface PaymobOrderRequest {
  auth_token: string;
  delivery_needed: boolean;
  amount_cents: number;
  currency: string;
  merchant_order_id?: string;
  items: PaymobOrderItem[];
}

export interface PaymobOrderItem {
  name: string;
  amount_cents: number;
  description: string;
  quantity: number;
}

export interface PaymobOrderResponse {
  id: number;
  created_at: string;
  delivery_needed: boolean;
  merchant: {
    id: number;
    created_at: string;
  };
  amount_cents: number;
  currency: string;
  is_payment_locked: boolean;
  is_return: boolean;
  is_cancel: boolean;
  is_returned: boolean;
  is_canceled: boolean;
  merchant_order_id: string | null;
  items: PaymobOrderItem[];
}

export interface PaymobPaymentKeyRequest {
  auth_token: string;
  amount_cents: number;
  expiration: number;
  order_id: number;
  billing_data: PaymobBillingData;
  currency: string;
  integration_id: number;
  lock_order_when_paid?: boolean;
}

export interface PaymobBillingData {
  apartment: string;
  email: string;
  floor: string;
  first_name: string;
  street: string;
  building: string;
  phone_number: string;
  shipping_method: string;
  postal_code: string;
  city: string;
  country: string;
  last_name: string;
  state: string;
}

export interface PaymobPaymentKeyResponse {
  token: string;
}

export interface PaymobTransactionCallback {
  obj: {
    id: number;
    pending: boolean;
    amount_cents: number;
    success: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_standalone_payment: boolean;
    is_voided: boolean;
    is_refunded: boolean;
    is_3d_secure: boolean;
    integration_id: number;
    profile_id: number;
    has_parent_transaction: boolean;
    order: {
      id: number;
      created_at: string;
      delivery_needed: boolean;
      merchant: {
        id: number;
        created_at: string;
        state: string;
        country: string;
        city: string;
        postal_code: string;
        street: string;
      };
      collector: null;
      amount_cents: number;
      shipping_data: null;
      currency: string;
      is_payment_locked: boolean;
      is_return: boolean;
      is_cancel: boolean;
      is_returned: boolean;
      is_canceled: boolean;
      merchant_order_id: string | null;
      wallet_notification: null;
      paid_amount_cents: number;
      notify_user_with_email: boolean;
      items: PaymobOrderItem[];
      order_url: string;
      commission_fees: number;
      delivery_fees_cents: number;
      delivery_vat_cents: number;
      payment_method: string;
      merchant_staff_tag: null;
      api_source: string;
      data: Record<string, unknown>;
    };
    created_at: string;
    transaction_processed_callback_responses: unknown[];
    currency: string;
    source_data: {
      type: string;
      pan: string;
      sub_type: string;
    };
    api_source: string;
    terminal_id: null;
    merchant_commission: number;
    installment: null;
    discount_details: unknown[];
    is_void: boolean;
    is_refund: boolean;
    data: {
      gateway_integration_pk: number;
      klass: string;
      created_at: string;
      amount: number;
      currency: string;
      migs_order: {
        acceptPartialAmount: boolean;
        amount: number;
        authenticationStatus: string;
        chargeback: Record<string, unknown>;
        creationTime: string;
        currency: string;
        description: string;
        id: string;
        lastUpdatedTime: string;
        merchantCategoryCode: string;
        status: string;
        totalAuthorizedAmount: number;
        totalCapturedAmount: number;
        totalRefundedAmount: number;
      };
      migs_transaction: Record<string, unknown>;
      txn_response_code: string;
      acq_response_code: string;
      message: string;
      merchant: string;
      order_info: string;
      receipt_no: string;
      transaction_no: string;
      batch_no: number;
      authorize_id: string;
      card_type: string;
      card_num: string;
      secure_hash: string;
      avs_result_code: string;
      avs_acq_response_code: string;
      captured_amount: number;
      authorised_amount: number;
      refunded_amount: number;
      acs_eci: string;
    };
    is_hidden: boolean;
    payment_key_claims: {
      user_id: number;
      amount_cents: number;
      currency: string;
      integration_id: number;
      order_id: number;
      billing_data: PaymobBillingData;
      lock_order_when_paid: boolean;
      extra: Record<string, unknown>;
      single_payment_attempt: boolean;
      exp: number;
      pmk_ip: string;
    };
    error_occured: boolean;
    is_live: boolean;
    other_endpoint_reference: null;
    refunded_amount_cents: number;
    source_id: number;
    is_captured: boolean;
    captured_amount: number;
    merchant_staff_tag: null;
    updated_at: string;
    owner: number;
    parent_transaction: null;
  };
  type: string;
}

export type PaymentMethod = 'card' | 'wallet' | 'fawry' | 'kiosk';

export interface CreatePaymentRequest {
  userId: string;
  amountEGP: number;
  description: string;
  paymentMethod: PaymentMethod;
  metadata?: {
    subscriptionId?: string;
    programId?: string;
    giftRecipientId?: string;
    type: 'subscription' | 'program' | 'gift';
  };
}

export interface PaymentIntent {
  id: string;
  orderId: number;
  paymentKey: string;
  iframeUrl: string;
  amountEGP: number;
  status: 'pending' | 'completed' | 'failed';
  expiresAt: string;
}
