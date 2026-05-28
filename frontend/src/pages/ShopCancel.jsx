import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import TactileButton from "@/components/TactileButton";

export default function ShopCancel() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-amber-50"
      data-testid="shop-cancel-page"
    >
      <div className="tactile-card bg-white max-w-md w-full p-8 text-center">
        <XCircle className="w-16 h-16 mx-auto text-rose-400" strokeWidth={3} />
        <h1 className="font-display font-bold text-3xl text-slate-900 mt-3">
          Checkout cancelled
        </h1>
        <p className="text-slate-700 mt-2">
          No charges were made. You can try again from the shop any time.
        </p>
        <div className="mt-6">
          <TactileButton
            color="#38BDF8"
            size="md"
            onClick={() => navigate("/")}
            data-testid="back-to-menu-button"
          >
            Back to Menu
          </TactileButton>
        </div>
      </div>
    </div>
  );
}
