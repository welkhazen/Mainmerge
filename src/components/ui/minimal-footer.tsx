import {
  FacebookIcon,
  GithubIcon,
  Grid2X2Plus,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from "lucide-react";

export function MinimalFooter() {
  const year = new Date().getFullYear();

  const company = [
    {
      title: "About Us",
      href: "#",
    },
    {
      title: "Careers",
      href: "#",
    },
    {
      title: "Brand Assets",
      href: "#",
    },
    {
      title: "Privacy Policy",
      href: "#",
    },
    {
      title: "Terms of Service",
      href: "#",
    },
  ];

  const resources = [
    {
      title: "Blog",
      href: "#",
    },
    {
      title: "Help Center",
      href: "#",
    },
    {
      title: "Contact Support",
      href: "#",
    },
    {
      title: "Community",
      href: "#",
    },
    {
      title: "Security",
      href: "#",
    },
  ];

  const socialLinks = [
    {
      icon: <FacebookIcon className="size-4" />,
      link: "#",
      label: "Facebook",
    },
    {
      icon: <GithubIcon className="size-4" />,
      link: "#",
      label: "GitHub",
    },
    {
      icon: <InstagramIcon className="size-4" />,
      link: "#",
      label: "Instagram",
    },
    {
      icon: <LinkedinIcon className="size-4" />,
      link: "#",
      label: "LinkedIn",
    },
    {
      icon: <TwitterIcon className="size-4" />,
      link: "#",
      label: "Twitter",
    },
    {
      icon: <YoutubeIcon className="size-4" />,
      link: "#",
      label: "YouTube",
    },
  ];

  return (
    <footer className="relative px-4 pb-10 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-raw-border/40 bg-[radial-gradient(35%_80%_at_30%_0%,rgba(255,255,255,0.06),transparent)] bg-raw-surface/30">
        <div className="grid grid-cols-6 gap-6 p-5 sm:p-6">
          <div className="col-span-6 flex flex-col gap-5 md:col-span-4">
            <a href="#" className="w-max text-raw-silver/35 transition-colors hover:text-raw-silver/60" aria-label="Brand home">
              <Grid2X2Plus className="size-8" />
            </a>

            <p className="max-w-sm text-sm text-raw-silver/65">
              A comprehensive financial technology platform.
            </p>

            <div className="flex flex-wrap gap-2">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  className="rounded-md border border-raw-border/60 p-1.5 text-raw-silver/65 transition-colors hover:bg-raw-surface/70 hover:text-raw-text"
                  target="_blank"
                  rel="noreferrer"
                  href={item.link}
                  aria-label={item.label}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-3 w-full md:col-span-1">
            <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-raw-silver/45">Resources</span>
            <div className="flex flex-col gap-1">
              {resources.map(({ href, title }) => (
                <a key={title} className="w-max py-1 text-sm text-raw-silver/70 transition-colors hover:text-raw-text hover:underline" href={href}>
                  {title}
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-3 w-full md:col-span-1">
            <span className="mb-1 block text-xs uppercase tracking-[0.16em] text-raw-silver/45">Company</span>
            <div className="flex flex-col gap-1">
              {company.map(({ href, title }) => (
                <a key={title} className="w-max py-1 text-sm text-raw-silver/70 transition-colors hover:text-raw-text hover:underline" href={href}>
                  {title}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-raw-border/50 px-4 py-5 sm:px-6">
          <p className="text-center text-sm text-raw-silver/55">
            © <a className="text-raw-gold/85 hover:text-raw-gold" href="https://x.com/sshahaider" target="_blank" rel="noreferrer">sshahaider</a>. All rights reserved {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
