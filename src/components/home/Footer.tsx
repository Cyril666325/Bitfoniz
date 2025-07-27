import Image from "next/image";
import Link from "next/link";
import React from "react";

const footerLinks = [
  {
    title: "Market",
    links: [
      { link: "Explore", href: "/signin" },
      { link: "Grants", href: "/signin" },
    ],
  },
  {
    title: "Trades",
    links: [
      {
        link: "Token",
        href: "/signin",
      },
      {
        link: "Order code",
        href: "/signin",
      },
    ],
  },
  {
    title: "Referrals",
    links: [
      {
        link: "Help Center",
        href: "/support",
      },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="container padding-x pt-[8rem] lg:pt-[16rem] pb-8">
      <section className="flex flex-col justify-center items-center md:flex-row md:justify-between md:items-start pb-[8rem] w-full gap-4">
        <Image src={"/assets/logo.svg"} alt="logo" width={152.37} height={63} />

        <div className="flex justify-between mt-8 md:mt-0 max-w-[580px] w-full">
          {footerLinks.map((item, index) => (
            <div key={index} className="flex items-start flex-col gap-6">
              <span className="font-medium text-[16px] font-poppins">
                {item.title}
              </span>
              <div className="flex items-start gap-4 flex-col">
                {item.links.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="font-light text-[14.88px] text-[#A1A3A7]"
                  >
                    {item.link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col md:flex-row gap-2 items-center justify-between pt-8 border-t border-[#FFFFFF1F]">
        <div className="flex items-center gap-6">
          <Link
            href={"/terms"}
            className="font-light text-[14.88px] text-[#A1A3A7]"
          >
            Terms
          </Link>
          <Link
            href={"/privacy"}
            className="font-light text-[14.88px] text-[#A1A3A7]"
          >
            Privacy
          </Link>
          <Link
            href={"/licences"}
            className="font-light text-[14.88px] text-[#A1A3A7]"
          >
            Licences
          </Link>
          <Link
            href={"/cookies"}
            className="font-light text-[14.88px] text-[#A1A3A7]"
          >
            Cookie Policy
          </Link>
        </div>
        <span className="font-light text-[14.88px] text-[#A1A3A7]">
          &copy; {new Date().getFullYear()} BITFONIZ Platform
        </span>
      </section>
    </footer>
  );
};

export default Footer;
