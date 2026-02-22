type Bid = {
  amount: number;
  companyName: string;
  emailAddress: string;
};

type BidWinner = {
  winningBid: Bid | null;
};

export default function BidWinner({ winningBid }: BidWinner) {
  if (!winningBid) {
    return <p className="mt-2 text-red-500 font-medium">Decision Pending</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-lg font-semibold">£{winningBid.amount}</p>

      <p className="text-sm text-gray-700">{winningBid.companyName}</p>

      <p className="text-sm text-gray-500">{winningBid.emailAddress}</p>
    </div>
  );
}
