import Mail from "nodemailer/lib/mailer/index.js";
import { createTransport, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

export default class TransporterClass {
    private transporter: Transporter; 

    constructor() {
        const options: SMTPTransport.Options = {
            service: process.env.TRANSPORTER_SERVICE,
            host: process.env.TRANSPORTER_HOST,
            port: parseInt(process.env.TRANSPORTER_PORT as string),
            secure: true,
            auth: {
                user: process.env.TRANSPORTER_USER,
                pass: process.env.TRANSPORTER_PASS
            }
        };
        this.transporter = createTransport(options);
    }

    /* Getter */

    private get getTransporter() {
        return (this.transporter);
    }

    /* Methods */

    async verifyTransporter(): Promise<boolean> {
        try {
            await this.getTransporter.verify();
            return (true);
        } catch {
            return (false);
        };
    }


    private handleSendMail(error: Error | null, info: any): void {
        if (error) {
            return ;
        } else {
            console.log("Email sent: ", info?.response);
            return ;
        };
    };

    sendMail(mailOptions: Mail.Options): boolean {
        try {
            this.getTransporter.sendMail(mailOptions, this.handleSendMail);
            return (true);
        } catch (error) {
            return (false);
        };
    }
}
