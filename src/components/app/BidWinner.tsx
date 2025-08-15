type Bid = {
  amount: number;
  companyName: string;
  emailAddress: string;
};

type BidWinner = {
  winningBid: Bid | null;
};

export default function BidWinner({ winningBid }: BidWinner) {
  return (
    <div className="">
      {winningBid ? (
        <div className="">
          <p>
            <strong>Bid Amount:</strong> ${winningBid.amount}
          </p>
          <p>
            <strong>Email:</strong> {winningBid.emailAddress}
          </p>
          <p>
            <strong>Name:</strong> {winningBid.companyName}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-red-500">Decision Pending</p>
      )}
    </div>
  );
}
