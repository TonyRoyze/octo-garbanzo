import { ArrowLeft, PackageCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "../../lib/currency";

type CheckoutViewProps = {
  itemCount: number;
  total: number;
  onBack: () => void;
  onNotify: (message: string) => void;
};

export function CheckoutView({
  itemCount,
  total,
  onBack,
  onNotify,
}: CheckoutViewProps) {
  return (
    <main className="mx-auto min-h-[calc(100svh-76px)] max-w-[52rem] px-[4vw] pt-12 pb-28">
      <button
        className="inline-flex items-center gap-2 border-0 bg-transparent py-2 text-[0.85rem] text-[#59685f] [&>svg]:w-4"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft />
        Back to your bag
      </button>
      <div className="my-16">
        <p className="mb-6 text-[0.8rem] font-[720] tracking-[0.025em] text-[#52685b]">
          Secure checkout
        </p>
        <h1 className="m-0 max-w-[14ch] font-heading text-[clamp(2.6rem,4.5vw,5rem)] font-[670] leading-[0.98] tracking-[-0.05em]">
          Ready for payment.
        </h1>
        <p className="max-w-[34rem] leading-[1.6] text-[#657169]">
          Your customer account is verified. Review the total before
          continuing.
        </p>
      </div>
      <div className="border border-[#18352b26] bg-[#fbfcf9] p-[clamp(1.5rem,4vw,3rem)]">
        <div className="flex items-center gap-4 border-b border-[#18352b1f] pb-8">
          <PackageCheck className="w-[2.4rem] text-[#52725f]" />
          <div>
            <h2 className="m-0 font-heading text-[1.05rem] font-[670]">Order ready</h2>
            <p className="mt-[0.35rem] line-clamp-2 max-w-[28ch] text-[0.86rem] leading-[1.45] text-[#68726c]">
              {itemCount} item{itemCount === 1 ? "" : "s"} reserved in your bag
            </p>
          </div>
        </div>
        <div className="flex items-end justify-between gap-4 py-12">
          <span className="text-[#68746d]">Total due</span>
          <strong className="font-heading text-[clamp(2.4rem,7vw,4.5rem)] leading-[0.9] tracking-[-0.05em]">
            {currency.format(total)}
          </strong>
        </div>
        <Button
          className="min-h-[2.9rem] w-full rounded-full bg-[#18352b] px-[1.4rem] text-[#f8faf6] hover:bg-[#244c3d]"
          onClick={() => onNotify("Payment provider can be connected next")}
        >
          Finalise payment
        </Button>
        <p className="mt-4 flex items-center justify-center gap-[0.45rem] text-[0.73rem] text-[#68746d] [&>svg]:w-[0.9rem]">
          <ShieldCheck /> Your account and order are securely verified
        </p>
      </div>
    </main>
  );
}
