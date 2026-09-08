import awasecaLogoUrl from "../../assets/diagnostic/awaseca-logo-color.webp?url";
import personazLogoUrl from "../../assets/diagnostic/personaz-logo.webp?url";

export function Topbar() {
  return (
    <header class="w-full bg-white border-b border-[#e6e6e6]">
      <div class="mx-auto flex max-w-[1200px] items-center justify-center gap-4 px-8 py-4 min-[700px]:gap-6">
        <img src={awasecaLogoUrl} alt="Awaseca" class="h-8 w-auto min-[700px]:h-14" />
        <span class="inline-flex items-center rounded-card bg-bluenavy px-2 py-1 min-[700px]:px-3 min-[700px]:py-2">
          <img src={personazLogoUrl} alt="personaZ" class="h-3.5 w-auto min-[700px]:h-5" />
        </span>
      </div>
    </header>
  );
}
