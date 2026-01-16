import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, phone, email, company, role, message } = await request.json();

    // Validar campos obrigatórios
    if (!name || !phone || !email || !company || !role) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Configurar transporte (SMTP)
    // Em produção, usar variáveis de ambiente
    // Caso não estejam configuradas, simulamos um sucesso para não quebrar a UX em dev (mas logamos o erro)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        const missingVars = [];
        if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
        if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
        if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS');
        
        console.error("Configurações de SMTP ausentes:", missingVars.join(', '));
        console.warn("ENV ATUAL:", process.env.NODE_ENV);
        
        // Se estiver em desenvolvimento, retornamos sucesso simulado
        if (process.env.NODE_ENV === 'development') {
            console.log("Simulando envio de email (Dev Mode):", { name, email, company });
            return NextResponse.json({ success: true, simulated: true });
        }

        return NextResponse.json(
            { error: `Erro de configuração no servidor de email. Faltando: ${missingVars.join(', ')}` },
            { status: 500 }
        );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Site PlannerSystem" <${process.env.SMTP_USER}>`,
      to: 'contato@plannersystem.com.br',
      replyTo: email,
      subject: `Novo Contato Comercial: ${company} - ${name}`,
      text: `
        Novo contato comercial recebido através do site.

        Nome: ${name}
        Telefone: ${phone}
        Email: ${email}
        Empresa: ${company}
        Cargo: ${role}

        Mensagem:
        ${message || 'Sem mensagem adicional'}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
            <h2 style="color: #2563eb;">Novo Contato Comercial</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin: 8px 0;"><strong>Nome:</strong> ${name}</p>
                <p style="margin: 8px 0;"><strong>Telefone:</strong> ${phone}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 8px 0;"><strong>Empresa:</strong> ${company}</p>
                <p style="margin: 8px 0;"><strong>Cargo:</strong> ${role}</p>
            </div>
            <div style="margin-top: 20px;">
                <p><strong>Mensagem:</strong></p>
                <p style="background-color: #fff; padding: 15px; border-left: 4px solid #2563eb;">
                    ${message ? message.replace(/\n/g, '<br>') : 'Sem mensagem adicional'}
                </p>
            </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json(
      { error: 'Falha ao enviar email. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
