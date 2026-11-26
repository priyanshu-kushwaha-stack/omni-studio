// The film's one research-card design (script.md: "title, authors, year, the kind of evidence"): an ink plate with a
// paper edge, the title in mustard Rubik 800, authors, year and evidence in cream, centred over the dimmed still.
// Two studies on one card stack with a mustard rule between.
import { loadFont } from "@remotion/google-fonts/Rubik";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { easeOut, mix, ramp, type Study } from "../data";

export const { fontFamily: BODY } = loadFont("normal", { weights: ["500"], subsets: ["latin", "latin-ext"] });

const StudyBlock: React.FC<{ s: Study; small: boolean; f: number; delay: number }> = ({ s, small, f, delay }) => {
  const k = easeOut(ramp(f, delay + 4, delay + 14));
  const plain = !s.authors && !s.year; // a card that is a sentence, not a study (the end card)
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: small ? 10 : 14 }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, color: MUSTARD, fontSize: plain ? 54 : small ? 56 : 70, lineHeight: 1.12,
        letterSpacing: 0.5, maxWidth: 1260 }}>
        {plain ? s.title : `“${s.title}”`}
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 500, color: PAPER, fontSize: small ? 34 : 40, opacity: k,
        transform: `translateY(${mix(10, 0, k)}px)` }}>
        {[s.authors, s.year].filter(Boolean).join(" · ")}
      </div>
      {s.evidence && (
        <div style={{ fontFamily: BODY, fontWeight: 500, color: PAPER, fontSize: small ? 28 : 32, lineHeight: 1.3, opacity: 0.82 * k,
          maxWidth: 1180, transform: `translateY(${mix(10, 0, k)}px)` }}>
          {s.evidence}
        </div>
      )}
    </div>
  );
};

export const Card: React.FC<{ studies: Study[]; f: number }> = ({ studies, f }) => {
  const k = easeOut(ramp(f, 0, 10));
  const small = studies.length > 1;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: INK, border: `7px solid ${PAPER}`, borderRadius: 24, padding: small ? "44px 70px" : "58px 84px",
        maxWidth: 1460, textAlign: "center", boxShadow: "0 22px 44px rgba(0,0,0,.5)", opacity: k,
        transform: `scale(${mix(0.94, 1, k)}) rotate(-0.6deg)`, display: "flex", flexDirection: "column", alignItems: "center",
        gap: small ? 30 : 0,
      }}>
        {studies.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            {i > 0 && <div style={{ width: 220, height: 5, borderRadius: 3, background: MUSTARD, opacity: 0.8 }} />}
            <StudyBlock s={s} small={small} f={f} delay={i * 10} />
          </div>
        ))}
      </div>
    </div>
  );
};
