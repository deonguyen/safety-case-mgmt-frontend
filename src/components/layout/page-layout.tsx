import Footer from "./footer";
import Header from "./header";

export default function Pagelayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div id="root" className="flex flex-col w-full min-h-screen">
      <div id="header" className="w-full items-center justify-center">
        <Header />
      </div>
      <div id="maincontainer" className="w-full flex-1">
        {children}
      </div>
      <div id="footer" className="w-full items-center justify-center">
        <Footer />
      </div>
    </div>
  );
}
