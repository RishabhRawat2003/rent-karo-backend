import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendEmailVerificationMail(to, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    // HTML styled email (change YEAR dynamically if you wish)
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f6fbff;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
      <table width="100%" bgcolor="#f6fbff" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="420" bgcolor="#ffffff" cellpadding="0" cellspacing="0" style="border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(20,71,230,0.10);">
              <tr>
                <td align="center" bgcolor="#1447e6" style="padding: 26px;">
                  <span style="font-size:30px;font-weight:700;letter-spacing:1px;color:#fff;">Rent Karo</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px 28px 24px 28px;">
                  <h2 style="margin:0 0 14px 0;color:#1447e6;font-size:22px;">Email Verification</h2>
                  <p style="color:#222;font-size:16px;margin:0 0 18px 0;">
                    <strong>Hi there,</strong>
                  </p>
                  <p style="color:#444;font-size:15px;margin:0 0 18px 0;">
                    Thank you for registering with <b>Rent Karo</b>! Please use the following OTP to verify your email address:
                  </p>
                  <div style="text-align:center;margin:28px 0;">
                    <span style="display:inline-block;padding:18px 0;width:180px;background:#e7f1ff;color:#1447e6;
                      font-size:30px;font-weight:600;letter-spacing:16px;border-radius:10px;box-shadow:0 3px 10px #e7f1ff;">
                      ${otp}
                    </span>
                  </div>
                  <p style="color:#666;font-size:14px;">
                    Enter this code on the verification page to complete your registration.
                  </p>
                  <p style="font-size:13px;color:#999;margin-top:24px;">
                    If you did not initiate this request, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" bgcolor="#f6fbff" style="padding:24px 0 16px 0;">
                  <span style="font-size:12px;color:#adb8c7;">
                    &copy; ${new Date().getFullYear()} Rent Karo. All rights reserved.
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await transporter.sendMail({
        from: `"Rent Karo" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'OTP Verification - Email Confirmation',
        text: `Hi there,\n\nYour OTP code for email verification is: ${otp}\n\nPlease enter this code to complete your verification.\n\nIf you did not request this, please ignore this email.\n\nThanks,\nTeam Rent Karo`,
        html
    });
}



export async function sendOrderConfirmationEmail(orderDetails) {
    const {
        name,
        email,
        phone,
        address,
        pincode,
        city,
        state,
        order_items,
        shipping_amount,
        items_total,
        total_amount,
        orderId
    } = orderDetails;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    // Create HTML email template
    const htmlTemplate = createOrderEmailTemplate({
        name,
        phone,
        orderId,
        order_items,
        shipping_amount,
        items_total,
        total_amount,
        address,
        city,
        state,
        pincode
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Order Confirmation - ${orderId} | Rent Karo`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
}

// HTML Email Template
function createOrderEmailTemplate(orderData) {
    const {
        name,
        orderId,
        order_items,
        shipping_amount,
        items_total,
        total_amount,
        address,
        city,
        state,
        pincode
    } = orderData;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f0f7ff; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #1447e6, #3b82f6); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: bold; 
            }
            .content { 
                padding: 30px; 
            }
            .order-info { 
                background-color: #f0f7ff; 
                border: 2px solid #1447e6; 
                border-radius: 10px; 
                padding: 20px; 
                margin: 20px 0; 
            }
            .order-id { 
                font-size: 18px; 
                font-weight: bold; 
                color: #1447e6; 
                margin-bottom: 10px; 
            }
            .section-title { 
                color: #1447e6; 
                font-size: 18px; 
                font-weight: bold; 
                margin: 25px 0 15px 0; 
                border-bottom: 2px solid #1447e6; 
                padding-bottom: 5px; 
            }
            .item { 
                background-color: #f8f9fa; 
                border-radius: 8px; 
                padding: 15px; 
                margin: 10px 0; 
                border-left: 4px solid #1447e6; 
            }
            .item-header { 
                font-weight: bold; 
                color: #333; 
                margin-bottom: 10px; 
            }
            .item-details { 
                color: #666; 
                font-size: 14px; 
                line-height: 1.6; 
            }
            .price-section { 
                background-color: #e8f4f8; 
                padding: 10px; 
                border-radius: 6px; 
                margin: 10px 0; 
            }
            .summary { 
                background-color: #f0f7ff; 
                border-radius: 10px; 
                padding: 20px; 
                margin: 20px 0; 
            }
            .summary-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 10px 0; 
                padding: 5px 0; 
            }
            .total-row { 
                border-top: 2px solid #1447e6; 
                padding-top: 15px; 
                font-weight: bold; 
                font-size: 18px; 
                color: #1447e6; 
            }
            .footer { 
                background-color: #333; 
                color: white; 
                text-align: center; 
                padding: 20px; 
            }
            .success-icon { 
                color: #22c55e; 
                font-size: 48px; 
                text-align: center; 
                margin: 20px 0; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛍️ RENT KARO</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Order Confirmation</p>
            </div>
            
            <div class="content">
                <div class="success-icon">✅</div>
                
                <h2 style="text-align: center; color: #333; margin-bottom: 10px;">
                    Thank you, ${name}!
                </h2>
                <p style="text-align: center; color: #666; font-size: 16px;">
                    Your order has been placed successfully and is being processed.
                </p>
                
                <div class="order-info">
                    <div class="order-id">Order ID: ${orderId}</div>
                    <div style="color: #666;">
                        <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
                        <strong>Expected Delivery:</strong> 3-5 Business Days
                    </div>
                </div>
                
                <div class="section-title">📦 Order Items</div>
                ${order_items.map((item, index) => `
                    <div class="item">
                        <div class="item-header">
                            ${index + 1}. Product: ${item.product_details.title}
                        </div>
                        <div class="item-details">
                            <strong>Quantity:</strong> ${item.quantity}<br>
                            ${item.wanted_to_sell ? '<strong>Type:</strong> Selling<br>' : ''}
                            
                            ${(item.realSellingPrice > 0 || item.sellingPrice > 0) ? `
                                <div class="price-section">
                                    <strong>💰 Selling Details:</strong><br>
                                    ${item.realSellingPrice > 0 ? `Real Price: ₹${item.realSellingPrice}<br>` : ''}
                                    ${item.sellingPrice > 0 ? `Selling Price: ₹${item.sellingPrice}<br>` : ''}
                                    ${item.discountOnSellingPrice > 0 ? `Discount: ${item.discountOnSellingPrice}%<br>` : ''}
                                </div>
                            ` : ''}
                            
                            ${item.rentalPricing && item.rentalPricing.length > 0 ? `
                                <div class="price-section">
                                    <strong>🏠 Rental Details:</strong><br>
                                    ${item.rentalPricing.map(rental => `
                                        ${rental.day} day(s): ₹${rental.realPrice}
                                        ${rental.discount > 0 ? `<br>&nbsp;&nbsp;Discount: ${rental.discount}% → Final: ₹${rental.discountPrice}` : ''}
                                    `).join('<br>')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
                
                <div class="section-title">🚚 Shipping Address</div>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; color: #666;">
                    ${name}<br>
                    ${address}<br>
                    ${city}, ${state} - ${pincode}
                </div>
                
                <div class="section-title">💳 Order Summary</div>
                <div class="summary">
                    <div class="summary-row">
                        <span>Items Total:</span>
                        <span>₹${items_total}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping Charges:</span>
                        <span>₹${shipping_amount}</span>
                    </div>
                    <div class="summary-row total-row">
                        <span>Total Amount:</span>
                        <span>₹${total_amount}</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #666; font-size: 14px;">
                        📧 Keep this email for your records<br>
                        📱 Track your order in the "My Orders" section
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p style="margin: 0;">Thank you for choosing Rent Karo!</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">
                    For support, contact us at ${process.env.EMAIL_USER}
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}
