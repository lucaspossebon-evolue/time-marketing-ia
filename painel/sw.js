// Lúmen · app de aprovação: recebe as notificações (peça nova, lembrete de prazo, avisos) e abre o painel ao tocar.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
// necessário para o navegador oferecer "Instalar app"; não guarda nada em cache (o painel precisa estar sempre atualizado)
self.addEventListener("fetch", () => {});

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { titulo: "Lúmen", texto: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.titulo || "Lúmen", {
    body: d.texto || "",
    icon: "/painel/app/icone-192.png",
    badge: "/painel/app/icone-192.png",
    tag: d.tag || undefined,
    renotify: !!d.tag,
    data: { url: d.url || "/painel/" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const alvo = new URL(e.notification.data?.url || "/painel/", self.location.origin).href;
  e.waitUntil((async () => {
    const abertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of abertas) if (c.url.startsWith(self.location.origin + "/painel")) { await c.focus(); c.navigate && c.navigate(alvo).catch(() => {}); return; }
    await self.clients.openWindow(alvo);
  })());
});
