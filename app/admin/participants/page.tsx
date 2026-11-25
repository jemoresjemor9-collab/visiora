import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import ParticipantsPanel from "../participants-panel";
export default async function Page(){
const db=await createClient();const {data}=await db.auth.getClaims();const uid=data?.claims?.sub as string|undefined;if(!uid)redirect("/connexion?mode=login");
const {data:admin}=await db.from("admin_users").select("role").eq("user_id",uid).maybeSingle();if(!admin)redirect("/espace");
const [p,c,a]=await Promise.all([db.from("participant_directory").select("*").order("created_at",{ascending:false}),db.from("campaigns").select("id,title,platform,status,target_subscribers").order("created_at",{ascending:false}).limit(500),db.from("participant_campaign_assignments").select("*").order("assigned_at",{ascending:false}).limit(1000)]);
return <main className="workspace-page"><header className="workspace-header"><a className="brand" href="/admin">Visiora.</a><nav className="admin-tabs"><a href="/admin">Vue générale</a><a href="/admin/campagnes">Campagnes</a><a className="active" href="/admin/participants">Participants</a></nav></header><section className="workspace-main"><div className="auth-kicker">ADMINISTRATION · PARTICIPANTS</div><h1>Gérer les participants.</h1><p className="workspace-email">Tu contrôles les adresses, les invitations et la distribution des campagnes.</p><ParticipantsPanel people={p.data||[]} campaigns={c.data||[]} assignments={a.data||[]}/></section></main>;
}