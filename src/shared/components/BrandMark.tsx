import { Link } from "react-router-dom";

export function BrandMark() {
  return (
    <Link className="brand-mark" to="/daily-bread" aria-label="Rootcellar home">
      <img src="/rootcellar-mark.svg" alt="" />
      <span>
        <strong>Rootcellar</strong>
        <small>Your homestead finally remembers.</small>
      </span>
    </Link>
  );
}
