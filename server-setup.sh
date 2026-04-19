#!/bin/bash
# ============================================================
# Skateclub Burgau – Server Setup Script
# Führe dieses Skript EINMALIG auf dem Hetzner Server aus
# ============================================================

set -e  # Bei Fehler abbrechen

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Skateclub Burgau – Server Setup          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# 1. System aktualisieren
echo "▶ 1/5 System aktualisieren..."
apt-get update -qq && apt-get upgrade -y -qq
echo "   ✅ System aktuell"

# 2. Firewall einrichten (UFW)
echo "▶ 2/5 Firewall einrichten..."
apt-get install -y -qq ufw
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8000/tcp  # Coolify
ufw --force enable
echo "   ✅ Firewall aktiv (Ports 22, 80, 443, 8000)"

# 3. Docker installieren
echo "▶ 3/5 Docker installieren..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh -q
    systemctl enable docker
    systemctl start docker
    echo "   ✅ Docker installiert"
else
    echo "   ✅ Docker bereits vorhanden"
fi

# 4. Coolify installieren
echo "▶ 4/5 Coolify installieren..."
echo "   (Das kann 2-3 Minuten dauern...)"
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash -q
echo "   ✅ Coolify installiert"

# 5. Automatische Sicherheitsupdates
echo "▶ 5/5 Automatische Sicherheitsupdates..."
apt-get install -y -qq unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades
echo "   ✅ Automatische Updates aktiviert"

# Fertig
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  ✅ Setup abgeschlossen!                  ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Coolify ist jetzt erreichbar unter:"
echo "  👉 http://94.130.57.133:8000"
echo ""
echo "Öffne diese Adresse im Browser und richte"
echo "deinen Coolify Admin-Account ein."
echo ""
