import {auth} from "@/lib/auth";
export default auth.middleware({loginUrl:"/auth/sign-in"});
export const config={matcher:["/admin/:path*","/api/admin/:path*"]};
