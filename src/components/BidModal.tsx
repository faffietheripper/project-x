"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createBidAction } from "@/app/items/[itemId]/actions";
import { useState } from "react";
import { Input } from "./ui/input";
import { getBidsForItem } from "@/data-access/bids";
import { getItem } from "@/data-access/items";
import { items } from "@/db/schema";

export default async function  BidModal({
  params: { itemId },
}: {
  params: { itemId: string };
}) {
  const [isOpen, setIsOpen] = useState(false);

  const item = await getItem(parseInt(itemId));

  const allBids = await getBidsForItem(item.id);

  return (
    <div className="">
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium px-4 py-2 rounded hover:opacity-90 transition-opacity"
      >
        Place Bid
      </button>
      <SpringModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

const SpringModal = ({ isOpen, setIsOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
          >
            <h1> Place Your Bid</h1>
            <form
              className="space-y-8"
              onSubmit={async (e) => {
                e.preventDefault();

                const form = e.currentTarget as HTMLFormElement;
                const formData = new FormData(form);

                const name = formData.get("name") as string;
                const emailAddress = formData.get("emailAddress") as string;
                const amount = parseInt(formData.get("amount") as string);

              

                await createBidAction.bind(null, {
                  item.id,
                  name: name,
                  amount: amount,
                  emailAddress: emailAddress,
                });
              }}
            >
              <Input
                required
                name="name"
                className="w-96 text-black"
                placeholder="Name of Organisation"
              />
              <Input
                required
                name="emailAddress"
                className="w-96 text-black"
                placeholder="Email Address"
              />
              //cant be less than the latestbidValue
              <Input
                required
                name="amount"
                type="number"
                className="w-96 text-black"
                step="0.01"
                placeholder="What's your bid?"
              />
              <button
                onClick={() => setIsOpen(false)}
                type="submit"
                className="bg-white hover:opacity-90 transition-opacity text-indigo-600 font-semibold w-full py-2 rounded"
              >
                Submit Bid
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


