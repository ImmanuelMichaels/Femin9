import { Sparkles, Baby, Salad, Heart, Stethoscope, Milk, Brain, Handshake, MessageCircle, ShieldCheck, Flower2, HandHeart } from 'lucide-react';
import { JOURNEY_CONFIG } from '../data/journey';
import { useApp } from '../context/AppContext';

const ALL_ITEMS = [
  { id: "assistant", Icon: Sparkles,      label: "Bloom AI",    bg: "var(--gdl)", tc: "var(--gd)"  },
  { id: "kicks",     Icon: Baby,          label: "Kicks",       bg: "var(--lvl)", tc: "var(--lv)"  },
  { id: "nutrition", Icon: Salad,         label: "Nutrition",   bg: "var(--sgl)", tc: "var(--sg)"  },
  { id: "vitals",    Icon: Heart,         label: "Vitals",      bg: "var(--rdl)", tc: "var(--rd)"  },
  { id: "health",    Icon: Stethoscope,   label: "Health",      bg: "var(--bll)", tc: "var(--bl)"  },
  { id: "baby",      Icon: Milk,          label: "Baby",        bg: "var(--gdl)", tc: "var(--gd)"  },
  { id: "mental",    Icon: Brain,         label: "Mind",        bg: "var(--sgl)", tc: "var(--sg)"  },
  { id: "partner",   Icon: Handshake,     label: "Partner",     bg: "var(--lvl)", tc: "var(--lv)"  },
  { id: "chat",      Icon: MessageCircle, label: "Chat",        bg: "var(--bll)", tc: "var(--bl)"  },
  { id: "safety",    Icon: ShieldCheck,   label: "Safety",      bg: "var(--rdl)", tc: "var(--rd)"  },
  { id: "ttc",       Icon: Flower2,       label: "Cycle & TTC", bg: "var(--rdl)", tc: "var(--rd)"  },
  { id: "nursing",   Icon: HandHeart,     label: "Nursing",     bg: "var(--sgl)", tc: "var(--sg)"  },
];

export default function MenuScreen({ setActive }) {
  const { journeyType } = useApp();
  const allowed = JOURNEY_CONFIG[journeyType]?.tabs || JOURNEY_CONFIG.pregnant.tabs;
  const items = ALL_ITEMS.filter(i => allowed.includes(i.id));

  return (
    <div className="page-pad">
      <div style={{ marginBottom: "var(--sp-5)" }}>
        <h2 className="serif" style={{ fontSize: "var(--fs-2xl)", fontWeight: 600, color: "var(--dp)", fontStyle: "italic", marginBottom: 4 }}>All Features</h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--mt)" }}>Tap any feature to open it</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap-md)" }}>
        {items.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "var(--sp-2)", padding: "var(--sp-4) var(--sp-2)",
            background: item.bg, border: `1.5px solid ${item.tc}33`,
            borderRadius: "var(--r2)", cursor: "pointer",
            transition: "transform 0.15s", boxShadow: "var(--sh)"
          }}
            onTouchStart={e => e.currentTarget.style.transform = "scale(0.95)"}
            onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}>
            <item.Icon size={28} color={item.tc} strokeWidth={1.8} />
            <span style={{ fontSize: "var(--fs-xs)", fontWeight: 800, color: item.tc, textAlign: "center", lineHeight: 1.3 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}