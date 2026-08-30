import {Resend} from "resend";

export async function notifyMarketing(subject:string,html:string){
  if(!process.env.RESEND_API_KEY)return{sent:false};
  const resend=new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({from:process.env.MAIL_FROM||"ACI Sindilojas <site@updates.acisindilojastm.com.br>",to:[process.env.MARKETING_EMAIL||"marketing@acisindilojastm.com.br"],subject,html,replyTo:process.env.MARKETING_EMAIL||"marketing@acisindilojastm.com.br"});
  return{sent:true};
}
