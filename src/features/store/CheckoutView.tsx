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
    <main className="store-page store-checkout-page">
      <button className="store-back" type="button" onClick={onBack}>
        <ArrowLeft />
        Back to your bag
      </button>
      <div className="store-page-heading">
        <p className="store-kicker">Secure checkout</p>
        <h1>Ready for payment.</h1>
        <p>
          Your customer account is verified. Review the total before
          continuing.
        </p>
      </div>
      <div className="store-checkout-card">
        <div className="checkout-confirm">
          <PackageCheck />
          <div>
            <h2>Order ready</h2>
            <p>
              {itemCount} item{itemCount === 1 ? "" : "s"} reserved in your bag
            </p>
          </div>
        </div>
        <div className="checkout-total">
          <span>Total due</span>
          <strong>{currency.format(total)}</strong>
        </div>
        <Button
          className="store-primary-action"
          onClick={() => onNotify("Payment provider can be connected next")}
        >
          Finalise payment
        </Button>
        <p className="checkout-security">
          <ShieldCheck /> Your account and order are securely verified
        </p>
      </div>
    </main>
  );
}
