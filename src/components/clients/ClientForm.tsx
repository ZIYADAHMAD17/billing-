"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/app/actions/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const clientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().optional(),
  email: z.string().email("Invalid email address"),
  billingAddress: z.string().optional(),
  paymentTerms: z.coerce.number().min(0).optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function ClientForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    // @ts-ignore
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      billingAddress: "",
      paymentTerms: 30,
    },
  });

  const onSubmit = async (data: ClientFormValues) => {
    setLoading(true);
    const res = await createClient(data);
    setLoading(false);
    
    if (res.success) {
      alert("Client created successfully!");
      reset();
      setOpen(false);
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button>Add New Client</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        {/* @ts-ignore */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input id="company" placeholder="Acme Corp" {...register("company")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingAddress">Billing Address</Label>
            <Input id="billingAddress" placeholder="123 Main St..." {...register("billingAddress")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms (Net X Days)</Label>
            <Input id="paymentTerms" type="number" {...register("paymentTerms")} />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
