export const verificationEmailTemplate = (name, link) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                h1 {
                    color: #333;
                }
                p {
                    color: #555;
                    font-size: 16px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    margin-top: 20px;
                    font-size: 16px;
                    color: #ffffff !important;
                    background-color: #007BFF;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .button:hover {
                    background-color: #0056b3;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Hi, ${name}!</h1>
                <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
                <a href="${link}" class="button">Verify Your Email</a>
                <p>If the button doesn't work, you can also click the link below:</p>
                <p><a href="${link}">${link}</a></p>
                <div class="footer">
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>&copy; ${new Date().getFullYear()} Taqrer. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};
