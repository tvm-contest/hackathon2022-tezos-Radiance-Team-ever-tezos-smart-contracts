pragma ton-solidity >= 0.43.0;

interface IBaseEvent {
    enum Vote { Empty, Confirm, Reject }
    enum Status { Initializing, Pending, Confirmed, Rejected }

    event Reject(uint relay);
    event Closed();
}
