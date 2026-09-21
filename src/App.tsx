import { useCallback, useEffect, useState } from "react";
import type { CreateProductInput, Product } from "./api";
import { productsApi } from "./api";
import { AuthForm } from "./AuthForm";
import { authApi, currentSession, signOut, type AuthSession } from "./auth";
import { Notice } from "./components/Notice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { AdminLogin } from "./features/admin/AdminLogin";
import { Storefront } from "./features/store/Storefront";
import type { StoreView } from "./features/store/types";
import "./App.css";

function App() {
  const [storefront, setStorefront] = useState(false);
  const [storeView, setStoreView] = useState<StoreView>("shop");
  const [session, setSession] = useState<AuthSession | null>(() =>
    currentSession(),
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [customerLoginOpen, setCustomerLoginOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const notify = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }, []);

  useEffect(() => {
    productsApi
      .list()
      .then(setProducts)
      .catch((error: Error) => notify(error.message))
      .finally(() => setLoading(false));
  }, [notify]);

  function openStore(view: StoreView = "shop") {
    setStorefront(true);
    setStoreView(view);
  }

  function logout() {
    signOut();
    setSession(null);
    notify("Signed out");
  }

  async function createProduct(product: CreateProductInput) {
    try {
      const created = await productsApi.create(product);
      setProducts((current) => [created, ...current]);
      notify("Product added");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not add product");
      throw error;
    }
  }

  async function updateProduct(id: string, product: CreateProductInput) {
    try {
      const updated = await productsApi.update(id, product);
      setProducts((current) =>
        current.map((candidate) => candidate.id === id ? updated : candidate),
      );
      setCart((current) =>
        current.map((candidate) => candidate.id === id ? updated : candidate),
      );
      notify("Product updated");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not update product");
      throw error;
    }
  }

  async function deleteProduct(id: string) {
    try {
      await productsApi.remove(id);
      setProducts((current) => current.filter((product) => product.id !== id));
      setCart((current) => current.filter((product) => product.id !== id));
      notify("Product removed");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not remove product",
      );
    }
  }

  function addToCart(product: Product) {
    setCart((current) =>
      current.some((item) => item.id === product.id)
        ? current
        : [...current, product],
    );
    notify("Added to bag");
  }

  async function prepareCheckout() {
    await authApi.prepareCheckout(cart.map((product) => product.id));
    setStoreView("checkout");
  }

  async function continueToPayment() {
    if (session?.user.role !== "CUSTOMER") {
      setCustomerLoginOpen(true);
      return;
    }
    try {
      await prepareCheckout();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not start checkout",
      );
    }
  }

  async function finishCustomerLogin(next: AuthSession) {
    setSession(next);
    setCustomerLoginOpen(false);
    try {
      await prepareCheckout();
      notify("Signed in successfully");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Could not start checkout",
      );
    }
  }

  if (storefront) {
    return (
      <>
        <Storefront
          products={products}
          cart={cart}
          view={storeView}
          userName={
            session?.user.role === "CUSTOMER" ? session.user.name : undefined
          }
          onView={setStoreView}
          onAdd={addToCart}
          onRemove={(id) =>
            setCart((current) => current.filter((product) => product.id !== id))
          }
          onAdmin={() => setStorefront(false)}
          onCheckout={continueToPayment}
          onLogout={logout}
          onNotify={notify}
        />
        <Dialog open={customerLoginOpen} onOpenChange={setCustomerLoginOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign in to continue</DialogTitle>
              <DialogDescription>
                Your bag is saved. Sign in or create an account before payment.
              </DialogDescription>
            </DialogHeader>
            <AuthForm onSuccess={finishCustomerLogin} />
          </DialogContent>
        </Dialog>
        {notice && <Notice message={notice} />}
      </>
    );
  }

  if (session?.user.role !== "ADMIN") {
    return (
      <AdminLogin
        onSuccess={setSession}
        onStore={() => openStore("shop")}
      />
    );
  }

  return (
    <>
      <AdminDashboard
        session={session}
        products={products}
        loading={loading}
        onCreateProduct={createProduct}
        onUpdateProduct={updateProduct}
        onDeleteProduct={deleteProduct}
        onLogout={logout}
        onViewStore={() => openStore("shop")}
        onNotify={notify}
      />
      {notice && <Notice message={notice} />}
    </>
  );
}

export default App;
