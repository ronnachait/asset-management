self.addEventListener("push", (event) => {
  console.log("Push event received", event);
  let data = {
    title: "แจ้งเตือนใหม่",
    body: "มีข้อมูลใหม่เข้ามา",
    icon: "/store_1175276.png",
    badge: "/bell.png",
    url: "/",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error("Error parsing push data:", e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: {
      url: data.url,
    },
    vibrate: [100, 50, 100], // สั่นเครื่องเวลาแจ้งเตือน (เป็น optional)
    actions: [
      {
        action: "open",
        title: "เปิดดู",
        icon: "/enter.png",
      },
      {
        action: "dismiss",
        title: "ปิด",
        icon: "/close.png",
      },
    ], // ปุ่มแอคชั่นใน notification (optional)
    requireInteraction: true, // ให้ notification ค้างจนกว่าผู้ใช้จะกด (optional)
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // ถ้ามี url ใน data ให้เปิด url นั้น
  const url = event.notification.data?.url || "/";

  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // ถ้ามี tab ที่เปิด url นี้อยู่แล้ว ให้ focus แท็บนั้น
          for (const client of clientList) {
            if (client.url.includes(url) && "focus" in client) {
              return client.focus();
            }
          }
          // ถ้าไม่มี ให้เปิดแท็บใหม่
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  } else if (event.action === "dismiss") {
    // ถ้ากดปิด ไม่ต้องทำอะไรเพิ่ม
  }
});
