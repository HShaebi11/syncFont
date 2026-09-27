import localFont from "next/font/local";

export const montrealMono = localFont({
  src: "../../../../packages/fonts/PPNeueMontrealMono-Regular.otf",
  weight: "400",
  variable: "--font-montreal-mono",
  display: "swap",
});

export const editorialNew = localFont({
  src: [
    {
      path: "../../../../packages/fonts/PPEditorialNew-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/PPEditorialNew-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-editorial",
  display: "swap",
});

export const brandFontClassName = `${montrealMono.variable} ${editorialNew.variable} ${montrealMono.className}`;
