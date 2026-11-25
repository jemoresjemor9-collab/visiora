import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "./dashboard";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect("/connexion");
  const userId = claimsData.claims.sub as string;
  const { data: admin } = await supabase.from("admin_users").select("role").eq("user_id", userId).maybeSingle();
  if (!admin) redirect("/espace");

  const [{ data: campaigns }, { data: payments }, { data: threads }, { data: events }] = await Promise.all([
    supabase.from("campaigns").select("id,user_id,platform,platform_url,target_subscribers,status,budget_amount,currency,created_at,title").order("created_at", { ascending: false }).limit(200),
    supabase.from("payments").select("id,user_id,campaign_id,amount,currency,status,provider,provider_reference,proof_url,admin_note,verified_at,created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("conversation_threads").select("id,subject,status,last_message_at,user_id,campaign_id").order("last_message_at", { ascending: false }).limit(100),
    supabase.from("campaign_events").select("campaign_id,event_type").eq("event_type", "voluntary_follow").limit(10000)
  ]);

  const userIds = [...new Set([
    ...(campaigns || []).map(item => item.user_id),
    ...(payments || []).map(item => item.user_id),
    ...(threads || []).map(item => item.user_id)
  ])];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id,display_name,avatar_url,phone,country_code").in("id", userIds)
    : { data: [] };

  return <main className="workspace-page">
    <header className="workspace-header">
      <Link href="/" className="brand"><span className="brand-mark"><img src="/visiora-mark.svg" alt="" /></span><span>Visiora<span className="brand-period">.</span></span></Link>
      <Link href="/espace" className="workspace-logout">Espace client</Link>
    </header>
    <section className="workspace-main">
      <div className="auth-kicker">ADMINISTRATION · {admin.role.toUpperCase()}</div>
      <h1>Tableau de bord.</h1>
      <p className="workspace-email">Gestion des campagnes, vérification des paiements et assistance client.</p>
      <AdminDashboard
        initialCampaigns={campaigns || []}
        initialPayments={payments || []}
        initialThreads={threads || []}
        profiles={profiles || []}
        followEvents={events || []}
      />
    </section>
  </main>;
}
