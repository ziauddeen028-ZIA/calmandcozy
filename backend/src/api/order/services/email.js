'use strict';

/**
 * Calm & Cozy Email Service
 *
 * Handles transactional emails for order notifications via Brevo SMTP.
 * Exposed as: strapi.service('api::order.email')
 *
 * Exports:
 *   sendCustomerOrderConfirmation(order) — confirmation email to the customer
 *   sendAdminNewOrderNotification(order) — summary email to the store owner
 *   sendStatusEmail(order, status)       — foundation for future status emails
 */

const brevo = require('@getbrevo/brevo');

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND = {
  name: 'Calm & Cozy',
  colorPrimary: '#2563EB',    // blue-600
  colorSecondary: '#1D4ED8',  // blue-700
  colorAccent: '#60A5FA',     // blue-400
  colorDark: '#1E3A8A',       // blue-900
  colorLight: '#EFF6FF',      // blue-50
  colorText: '#0F172A',       // slate-900
  colorMuted: '#64748B',      // slate-500
  colorBorder: '#E2E8F0',     // slate-200
  colorBg: '#F8FAFC',         // slate-50
  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
};

// ─── Brevo API factory (lazy, singleton per process) ──────────────────────────
let _apiInstance = null;

function getBrevoApi() {
  if (_apiInstance) return _apiInstance;

  // Polyfill v3 SendSmtpEmail class for backward compatibility with existing send methods
  if (!brevo.SendSmtpEmail) {
    brevo.SendSmtpEmail = class SendSmtpEmail {};
  }

  const client = new brevo.BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  // Expose a v3-compatible adapter interface
  _apiInstance = {
    sendTransacEmail: (req) => client.transactionalEmails.sendTransacEmail(req)
  };

  return _apiInstance;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees.
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Format a shipping address object into a human-readable multi-line string.
 */
function formatAddress(addr) {
  if (!addr) return 'N/A';
  const lines = [
    addr.full_name,
    addr.address_line_1,
    addr.address_line_2,
    addr.city && addr.state ? `${addr.city}, ${addr.state}` : addr.city || addr.state,
    addr.pincode,
    addr.country,
    addr.phone ? `📞 ${addr.phone}` : null,
  ].filter(Boolean);
  return lines.join('<br>');
}

/**
 * Build an HTML table row of ordered items.
 */
function buildProductRows(orderItems) {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return `<tr><td colspan="4" style="padding:12px;text-align:center;color:${BRAND.colorMuted};">No items found</td></tr>`;
  }

  return orderItems
    .map((item) => {
      const name = item.productName || 'Product';
      const qty = item.quantity || 1;
      const price = formatCurrency(item.price);
      const subtotal = formatCurrency(item.subtotal || (item.price * qty));
      const variantParts = [item.selectedColor, item.selectedSize].filter(Boolean).join(' / ');
      const customText = item.customText ? `<br><span style="color:${BRAND.colorMuted};font-size:11px;">Customization: ${item.customText}</span>` : '';

      return `
       <tr style="border-bottom:1px solid ${BRAND.colorBorder};">

  <td style="padding:12px 8px;">
    ${item.frontMockupUrl || item.productImage
          ? `<img
             src="${item.frontMockupUrl || item.productImage}"
             width="60"
             height="60"
             style="
               display:block;
               width:60px;
               height:60px;
               object-fit:cover;
               border-radius:8px;
               border:1px solid ${BRAND.colorBorder};
             "
           />`
          : '🛍️'
        }
  </td>

  <td style="padding:12px 8px;">
    <strong>${name}</strong>
    ${variantParts
          ? `<br><span style="font-size:12px;color:${BRAND.colorMuted};">${variantParts}</span>`
          : ''
        }
    ${customText}
  </td>

  <td style="padding:12px 8px;text-align:center;">
    ${qty}
  </td>

  <td style="padding:12px 8px;text-align:right;">
    ${price}
  </td>

  <td style="padding:12px 8px;text-align:right;font-weight:700;">
    ${subtotal}
  </td>

</tr>`;
    })
    .join('');
}

// ─── HTML Email Templates ──────────────────────────────────────────────────────

/**
 * Responsive, premium HTML template for the customer order confirmation email.
 * Blue theme — Apple-inspired, Gmail & Outlook compatible.
 */
function buildCustomerEmailHTML(order) {
  const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
  const shippingAddr = order.shippingAddress || {};
  const isPaid = order.paymentStatus === 'paid';
  const paymentBadgeBg = isPaid ? '#16A34A' : '#DC2626';
  const paymentBadgeLabel = (order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1);
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── Product rows (thumbnail + name + variants + qty + price) ───────────────
  function buildProductCards(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return `
        <tr>
          <td style="padding:20px;text-align:center;color:${BRAND.colorMuted};font-size:14px;">No items found</td>
        </tr>`;
    }

    return items.map((item) => {
      const name = item.productName || 'Product';
      const qty = item.quantity || 1;
      const price = formatCurrency(item.price);
      const subtotal = formatCurrency(item.subtotal || (item.price * qty));
      const variantParts = [item.selectedColor, item.selectedSize].filter(Boolean).join(' · ');
      const customNote = item.customText
        ? `<tr><td colspan="2" style="padding:0 0 12px;"><span style="display:inline-block;background:#FFF7ED;border:1px solid #FED7AA;color:#9A3412;font-size:11px;padding:2px 8px;border-radius:4px;">✏️ ${item.customText}</span></td></tr>`
        : '';
      const imgSrc = item.frontMockupUrl || item.productImage || '';
      const imgCell = imgSrc
        ? `<td width="64" valign="top" style="padding:0 14px 0 0;">
             <img src="${imgSrc}" width="64" height="64" alt="${name}" style="display:block;width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid ${BRAND.colorBorder};" />
           </td>`
        : `<td width="64" valign="top" style="padding:0 14px 0 0;">
             <div style="width:64px;height:64px;border-radius:10px;background:${BRAND.colorLight};border:1px solid ${BRAND.colorBorder};display:table-cell;vertical-align:middle;text-align:center;">
               <span style="font-size:24px;">🛍️</span>
             </div>
           </td>`;

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid ${BRAND.colorBorder};">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${imgCell}
                <td valign="top">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:${BRAND.colorText};line-height:1.4;">${name}</p>
                        ${variantParts ? `<p style="margin:0 0 3px;font-size:12px;color:${BRAND.colorMuted};">${variantParts}</p>` : ''}
                        <p style="margin:0;font-size:12px;color:${BRAND.colorMuted};">Qty: ${qty}</p>
                      </td>
                      <td align="right" valign="top">
                        <p style="margin:0;font-size:15px;font-weight:700;color:${BRAND.colorPrimary};">${subtotal}</p>
                        ${qty > 1 ? `<p style="margin:2px 0 0;font-size:11px;color:${BRAND.colorMuted};">${price} each</p>` : ''}
                      </td>
                    </tr>
                    ${customNote}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    }).join('');
  }

  // ── Pricing rows ───────────────────────────────────────────────────────────
  const subtotalAmt = orderItems.reduce((sum, i) => sum + (i.subtotal || (i.price * (i.quantity || 1))), 0);
  const shippingAmt = (order.total || 0) - subtotalAmt;
  const shippingLabel = shippingAmt <= 0 ? 'Free' : formatCurrency(shippingAmt);

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Order Confirmed – ${BRAND.name}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.colorBg};font-family:${BRAND.fontFamily};color:${BRAND.colorText};-webkit-font-smoothing:antialiased;">

<!-- Preheader (hidden preview text) -->
<div style="display:none;max-height:0;overflow:hidden;color:${BRAND.colorBg};">Order ${order.orderId} confirmed — ${formatCurrency(order.total)} · ${BRAND.name}</div>

<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${BRAND.colorBg};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;">

        <!-- ══════════════════════════════════════════════════════ -->
        <!--  1. LOGO + HEADER                                      -->
        <!-- ══════════════════════════════════════════════════════ -->
        <tr>
          <td style="background:linear-gradient(160deg,${BRAND.colorSecondary} 0%,${BRAND.colorPrimary} 100%);border-radius:16px 16px 0 0;padding:36px 40px 32px;text-align:center;">
            <!-- Logo wordmark -->
           <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 20px;">
  <tr>
    <td align="center">
      <img
        src="https://res.cloudinary.com/dbzgeww5y/image/upload/v1781093459/white_logo_4c9c304735.png"
        alt="Calm & Cozy"
        width="150"
        referrerpolicy="no-referrer"
        style="
          display:block;
          max-width:150px;
          height:auto;
          border:0;
          outline:none;
          text-decoration:none;
        "
      />
    </td>
  </tr>
</table>
            <!-- Check icon circle -->
            <div style="width:56px;height:56px;color:#ffffff;font-size:32px;font-weight:bold;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);border-radius:50%;margin:0 auto 16px;line-height:56px;text-align:center;font-size:26px;">✓</div>
            <h1 style="margin:0 0 6px;color:#FFFFFF;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Order Confirmed!</h1>
            <p style="margin:0;color:${BRAND.colorAccent};font-size:14px;letter-spacing:0.3px;">We've received your order and it's being prepared.</p>
          </td>
        </tr>

        <!-- ══════════════════════════════════════════════════════ -->
        <!--  2. ORDER CONFIRMATION CARD                            -->
        <!-- ══════════════════════════════════════════════════════ -->
        <tr>
          <td style="background:#FFFFFF;padding:0 40px;">
            <div style="margin:28px 0 0;background:${BRAND.colorLight};border:1px solid #BFDBFE;border-radius:12px;padding:20px 24px;">
              <p style="margin:0 0 16px;font-size:15px;color:${BRAND.colorText};">Hi <strong style="color:${BRAND.colorSecondary};">${order.userName || 'Valued Customer'}</strong> 👋</p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <!-- Order ID -->
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #DBEAFE;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;color:${BRAND.colorMuted};text-transform:uppercase;letter-spacing:0.6px;font-weight:600;">Order ID</td>
                        <td align="right" style="font-size:13px;font-weight:700;color:${BRAND.colorPrimary};font-family:monospace;">${order.orderId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Date -->
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #DBEAFE;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;color:${BRAND.colorMuted};text-transform:uppercase;letter-spacing:0.6px;font-weight:600;">Date</td>
                        <td align="right" style="font-size:13px;color:${BRAND.colorText};">${orderDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Payment Status -->
                <tr>
                  <td style="padding:8px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;color:${BRAND.colorMuted};text-transform:uppercase;letter-spacing:0.6px;font-weight:600;">Payment</td>
                        <td align="right">
                          <span style="display:inline-block;background:${paymentBadgeBg};color:#FFFFFF;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.4px;">${paymentBadgeLabel}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- ══════════════════════════════════════════════════════ -->
        <!--  3. PRODUCT THUMBNAILS                                 -->
        <!-- ══════════════════════════════════════════════════════ -->
        <tr>
          <td style="background:#FFFFFF;padding:28px 40px 0;">
            <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:${BRAND.colorMuted};text-transform:uppercase;letter-spacing:0.8px;">Items Ordered</p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              ${buildProductCards(orderItems)}
            </table>
          </td>
        </tr>

        <!-- ══════════════════════════════════════════════════════ -->
        <!--  4. PRICING BREAKDOWN                                  -->
        <!-- ══════════════════════════════════════════════════════ -->
        <tr>
          <td style="background:#FFFFFF;padding:20px 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.colorLight};border:1px solid #BFDBFE;border-radius:12px;padding:16px 20px;">
              <tr>
                <td style="padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <!-- Subtotal -->
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:${BRAND.colorMuted};">Subtotal</td>
                      <td align="right" style="padding:6px 0;font-size:13px;color:${BRAND.colorText};">${formatCurrency(subtotalAmt)}</td>
                    </tr>
                    <!-- Shipping -->
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:${BRAND.colorMuted};">Shipping</td>
                      <td align="right" style="padding:6px 0;font-size:13px;color:${shippingAmt <= 0 ? '#16A34A' : BRAND.colorText};font-weight:${shippingAmt <= 0 ? '600' : '400'};">${shippingAmt <= 0 ? '🎉 Free' : shippingLabel
    }</td>
                    </tr>
                    <!-- Divider -->
                    <tr><td colspan="2" style="padding:8px 0;"><div style="height:1px;background:#BFDBFE;"></div></td></tr>
                    <!-- Total -->
                    <tr>
                      <td style="padding:4px 0;font-size:16px;font-weight:700;color:${BRAND.colorSecondary};">Total</td>
                      <td align="right" style="padding:4px 0;font-size:18px;font-weight:800;color:${BRAND.colorPrimary};">${formatCurrency(order.total)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══════════════════════════════════════════════════════ -->
        <!--  5. SHIPPING ADDRESS CARD                              -->
        <!-- ══════════════════════════════════════════════════════ -->
        <tr>
          <td style="background:#FFFFFF;padding:0 40px 28px;">
            <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:${BRAND.colorMuted};text-transform:uppercase;letter-spacing:0.8px;">Shipping Address</p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid ${BRAND.colorBorder};border-radius:12px;">
              <tr>
                <td style="padding:16px 20px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:0 12px 0 0;font-size:22px;vertical-align:top;">📍</td>
                      <td style="font-size:13px;color:${BRAND.colorMuted};line-height:1.8;">${formatAddress(shippingAddr)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══════════════════════════════════════════════════════ -->
        <!--  6. CONTINUE SHOPPING BUTTON                           -->
        <!-- ══════════════════════════════════════════════════════ -->
        <tr>
          <td style="background:#FFFFFF;padding:0 40px 36px;text-align:center;">
            <p style="margin:0 0 20px;font-size:13px;color:${BRAND.colorMuted};line-height:1.7;">We'll notify you once your order ships. Keep an eye on your inbox!</p>
            <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://calmandcozy.in/shop" style="height:46px;v-text-anchor:middle;width:220px;" arcsize="22%" fillcolor="#2563EB"><w:anchorlock/><center style="color:#FFFFFF;font-size:15px;font-weight:700;">Continue Shopping</center></v:roundrect><![endif]-->
            <!--[if !mso]><!-->
            <a href="https://calmandcozy.in/shop" target="_blank"
              style="display:inline-block;background:linear-gradient(135deg,${BRAND.colorPrimary} 0%,${BRAND.colorSecondary} 100%);color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;">
              Continue Shopping →
            </a>
            <!--<![endif]-->
          </td>
        </tr>

        <!-- ══════════════════════════════════════════════════════ -->
        <!--  7. FOOTER                                             -->
        <!-- ══════════════════════════════════════════════════════ -->
        <tr>
          <td style="background:${BRAND.colorDark};border-radius:0 0 16px 16px;padding:28px 40px;text-align:center;">
            <!-- Social links -->
            <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 16px;">
              <tr>
                <td style="padding:0 8px;">
  <a
    href="https://www.instagram.com/calmandcozy.in/"
    style="
      display:inline-block;
      background:rgba(255,255,255,0.1);
      border:1px solid rgba(255,255,255,0.15);
      border-radius:8px;
      padding:8px 16px;
      text-decoration:none;
      color:#FFFFFF;
      font-size:13px;
      font-weight:600;
    "
  >
    Instagram
  </a>
</td>
                <td style="padding:0 8px;">
                 <a href="mailto:calmandcozy34@gmail.com"
   style="
     display:inline-block;
     background:rgba(255,255,255,0.1);
     border:1px solid rgba(255,255,255,0.15);
     border-radius:8px;
     padding:8px 16px;
     text-decoration:none;
     color:#FFFFFF;
     font-size:13px;
     font-weight:600;
   ">
   Email Support
</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:12px;">© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p>
            <p style="margin:0;color:rgba(255,255,255,0.35);font-size:11px;">This is a transactional email — please do not reply.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/**
 * Responsive HTML template for the admin new-order notification email.
 */
function buildAdminEmailHTML(order) {
  const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
  const shippingAddr = order.shippingAddress || {};

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Order – ${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:${BRAND.fontFamily};color:${BRAND.colorText};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- ── Header ───────────────────────────────────────────── -->
          <tr>
            <td style="background:${BRAND.colorDark};border-radius:16px 16px 0 0;padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;color:#99f6e4;font-size:11px;text-transform:uppercase;letter-spacing:1px;">${BRAND.name} Admin</p>
                    <h1 style="margin:4px 0 0;color:#ffffff;font-size:22px;font-weight:700;">🛍️ New Order Received</h1>
                  </td>
                  <td align="right">
                    <span style="background:${BRAND.colorAccent};color:#fff;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700;">
                      ${formatCurrency(order.total)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body ─────────────────────────────────────────────── -->
          <tr>
            <td style="background:#ffffff;padding:32px;">

              <!-- Order ID -->
              <p style="margin:0 0 20px;font-size:14px;color:${BRAND.colorMuted};">
                Order ID: <strong style="color:${BRAND.colorPrimary};font-size:16px;">${order.orderId}</strong>
              </p>

              <!-- Customer Details -->
              <h3 style="margin:0 0 14px;font-size:15px;font-weight:700;color:${BRAND.colorDark};border-bottom:2px solid ${BRAND.colorBorder};padding-bottom:8px;">
                Customer Details
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                ${[
      ['Name', order.userName],
      ['Email', order.email],
      ['Phone', order.phone],
    ].map(([label, value]) => `
                  <tr>
                    <td style="padding:7px 0;font-size:13px;color:${BRAND.colorMuted};width:100px;">${label}</td>
                    <td style="padding:7px 0;font-size:13px;color:${BRAND.colorText};font-weight:600;">${value || '—'}</td>
                  </tr>`).join('')}
              </table>

              <!-- Products Table -->
              <h3 style="margin:0 0 14px;font-size:15px;font-weight:700;color:${BRAND.colorDark};border-bottom:2px solid ${BRAND.colorBorder};padding-bottom:8px;">
                Products Ordered
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:28px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:10px 8px;text-align:left;font-size:12px;color:${BRAND.colorMuted};text-transform:uppercase;letter-spacing:0.5px;">Image</th>
                    <th style="padding:10px 8px;text-align:left;font-size:12px;color:${BRAND.colorMuted};text-transform:uppercase;letter-spacing:0.5px;">Product</th>
                    <th style="padding:10px 8px;text-align:center;font-size:12px;color:${BRAND.colorMuted};text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
                    <th style="padding:10px 8px;text-align:right;font-size:12px;color:${BRAND.colorMuted};text-transform:uppercase;letter-spacing:0.5px;">Price</th>
                    <th style="padding:10px 8px;text-align:right;font-size:12px;color:${BRAND.colorMuted};text-transform:uppercase;letter-spacing:0.5px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildProductRows(orderItems)}
                </tbody>
              </table>

              <!-- Order Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="right">
                    <div style="display:inline-block;background:${BRAND.colorDark};color:#fff;border-radius:10px;padding:12px 24px;text-align:right;">
                      <span style="font-size:12px;opacity:0.8;">Order Total</span><br>
                      <span style="font-size:22px;font-weight:700;">${formatCurrency(order.total)}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;color:${BRAND.colorDark};border-bottom:2px solid ${BRAND.colorBorder};padding-bottom:8px;">
                Shipping Address
              </h3>
              <p style="margin:0;font-size:14px;color:${BRAND.colorMuted};line-height:1.7;">
                ${formatAddress(shippingAddr)}
              </p>

            </td>
          </tr>

          <!-- ── Footer ────────────────────────────────────────────── -->
          <tr>
            <td style="background:${BRAND.colorDark};border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#5eead4;font-size:12px;">${BRAND.name} — Internal Order Notification</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Service Definition ────────────────────────────────────────────────────────

module.exports = {
  /**
   * Send a branded order confirmation email to the customer.
   * @param {Object} order – The Strapi order object (result from afterCreate/afterUpdate).
   */
  async sendCustomerOrderConfirmation(order) {
    strapi.log.info('[EMAIL SERVICE] CUSTOMER EMAIL STARTED — orderId:', order.orderId);

    if (!order.email) {
      strapi.log.warn('[EMAIL SERVICE] No customer email on order, skipping.');
      return;
    }

    try {
      const apiInstance = getBrevoApi();
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `Order Confirmed ✓ — ${order.orderId}`;
      sendSmtpEmail.htmlContent = buildCustomerEmailHTML(order);
      sendSmtpEmail.sender = { name: BRAND.name, email: 'calmandcozy34@gmail.com' };
      sendSmtpEmail.to = [{ email: order.email }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      strapi.log.info('[EMAIL SERVICE] CUSTOMER EMAIL SENT — to:', order.email);
    } catch (err) {
      strapi.log.error('[EMAIL SERVICE] EMAIL ERROR (customer):', err.message);
      console.error(err);
      throw err; // Re-throw so caller can decide how to handle
    }
  },

  /**
   * Send a concise order summary notification to the store admin.
   * @param {Object} order – The Strapi order object.
   */
  async sendAdminNewOrderNotification(order) {
    strapi.log.info('[EMAIL SERVICE] ADMIN EMAIL STARTED — orderId:', order.orderId);

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      strapi.log.warn('[EMAIL SERVICE] ADMIN_EMAIL not set, skipping admin notification.');
      return;
    }

    try {
      const apiInstance = getBrevoApi();
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `New Order Received — ${order.orderId}`;
      sendSmtpEmail.htmlContent = buildAdminEmailHTML(order);
      sendSmtpEmail.sender = { name: `${BRAND.name} Notifications`, email: 'calmandcozy34@gmail.com' };
      sendSmtpEmail.to = [{ email: adminEmail }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      strapi.log.info('[EMAIL SERVICE] ADMIN EMAIL SENT — to:', adminEmail);
    } catch (err) {
      strapi.log.error('[EMAIL SERVICE] EMAIL ERROR (admin):', err.message);
      console.error(err);
      throw err; // Re-throw so caller can decide how to handle
    }
  },

  /**
   * Foundation for future order status emails (shipped, delivered, cancelled…).
   *
   * Usage (from future lifecycle or controller):
   *   await strapi.service('api::order.email').sendStatusEmail(order, 'shipped');
   *
   * @param {Object} order  – The Strapi order object.
   * @param {string} status – New order status, e.g. 'shipped', 'delivered', 'cancelled'.
   */
  async sendStatusEmail(order, status) {
    strapi.log.info(`[EMAIL SERVICE] STATUS EMAIL STARTED — orderId: ${order.orderId}, status: ${status}`);

    if (!order.email) {
      strapi.log.warn('[EMAIL SERVICE] No customer email on order, skipping status email.');
      return;
    }

    // Status-specific copy
    const statusMeta = {
      shipped: {
        subject: `Your order has shipped 🚚 — ${order.orderId}`,
        heading: 'Your Order Is On Its Way!',
        body: 'Great news — your order has been dispatched and is heading your way. You will receive tracking details shortly.',
        emoji: '🚚',
      },
      delivered: {
        subject: `Order delivered ✅ — ${order.orderId}`,
        heading: 'Your Order Has Been Delivered!',
        body: 'We hope you love your ${BRAND.name} order! If you have any questions, feel free to reach out.',
        emoji: '✅',
      },
      cancelled: {
        subject: `Order cancelled — ${order.orderId}`,
        heading: 'Your Order Has Been Cancelled',
        body: 'Your order has been cancelled. If you didn\'t request this or need help, please contact our support team.',
        emoji: '❌',
      },
    };

    const meta = statusMeta[status] || {
      subject: `Order update — ${order.orderId}`,
      heading: 'Order Status Update',
      body: `Your order status has been updated to: ${status}.`,
      emoji: '📦',
    };

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /><title>${meta.subject}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:${BRAND.fontFamily};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="background:linear-gradient(135deg,${BRAND.colorDark} 0%,${BRAND.colorPrimary} 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center;">
            <div style="font-size:48px;">${meta.emoji}</div>
            <h1 style="margin:12px 0 0;color:#fff;font-size:24px;font-weight:700;">${meta.heading}</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;border-radius:0 0 16px 16px;padding:32px;text-align:center;">
            <p style="font-size:16px;color:${BRAND.colorMuted};line-height:1.7;margin:0 0 20px;">${meta.body}</p>
            <p style="font-size:14px;color:${BRAND.colorMuted};">Order ID: <strong style="color:${BRAND.colorPrimary};">${order.orderId}</strong></p>
            <p style="margin:32px 0 0;font-size:13px;color:${BRAND.colorMuted};">— The ${BRAND.name} Team</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      const apiInstance = getBrevoApi();
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = meta.subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.sender = { name: BRAND.name, email: 'calmandcozy34@gmail.com' };
      sendSmtpEmail.to = [{ email: order.email }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      strapi.log.info(`[EMAIL SERVICE] STATUS EMAIL SENT — status: ${status}, to: ${order.email}`);
    } catch (err) {
      strapi.log.error('[EMAIL SERVICE] EMAIL ERROR (status):', err.message);
      console.error(err);
      throw err;
    }
  },
};
