import logoUrl from "../../assets/diagnostic/awaseca-logo.svg?url";

export function Topbar() {
  return (
    <header class="w-full bg-white border-b border-[#e6e6e6]">
      <div class="mx-auto flex max-w-[1200px] items-center justify-center px-8 py-4 min-h-16">
        <img src={logoUrl} alt="Awaseca" class="h-10 w-auto" />
      </div>
    </header>
  );
}
