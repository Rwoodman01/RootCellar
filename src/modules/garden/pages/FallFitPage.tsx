import { useMemo, useState } from "react";
import { PageHeader } from "../../../shared/components/PageHeader";
import { formatShortDate } from "../../../shared/utils/dates";
import { CROP_DEFAULTS } from "../constants";
import { fallFit } from "../calculations";
import { useGarden } from "../useGarden";

export function FallFitPage() {
  const { data } = useGarden();
  const [crop, setCrop] = useState("Lettuce");
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().slice(0, 10));
  const [firstFrostDate, setFirstFrostDate] = useState(data.settings.firstFrostDate);
  const [fallFactorDays, setFallFactorDays] = useState(14);
  const result = useMemo(() => fallFit(crop, sowingDate, firstFrostDate, fallFactorDays), [crop, sowingDate, firstFrostDate, fallFactorDays]);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Succession helper" title="Will this fall crop fit?">
        <p>A simple first-frost check with a fall slowdown factor. It is intentionally a helper, not a calendar engine.</p>
      </PageHeader>
      <section className="split-layout">
        <form className="form-panel">
          <div className="form-grid">
            <label>Crop<select value={crop} onChange={(event) => setCrop(event.target.value)}>{CROP_DEFAULTS.map((entry) => <option key={entry.crop} value={entry.crop}>{entry.crop}</option>)}</select></label>
            <label>Sowing date<input type="date" value={sowingDate} onChange={(event) => setSowingDate(event.target.value)} /></label>
            <label>First frost<input type="date" value={firstFrostDate} onChange={(event) => setFirstFrostDate(event.target.value)} /></label>
            <label>Fall factor days<input type="number" min="0" value={fallFactorDays} onChange={(event) => setFallFactorDays(Number(event.target.value))} /></label>
          </div>
        </form>
        <aside className="estimate-panel">
          <p className="eyebrow">Fit check</p>
          <h2>{result.fits ? "Likely fits" : "Likely tight"}</h2>
          <p>{result.crop} uses {result.dtm} DTM plus {result.fallFactorDays} slower fall days.</p>
          <div className="estimate-pills"><span><strong>{formatShortDate(result.estimatedHarvestDate)}</strong> estimated harvest</span><span><strong>{formatShortDate(firstFrostDate)}</strong> first frost</span></div>
        </aside>
      </section>
    </div>
  );
}
