// get rid of defining enum values

export enum GameStatus {
    InProgress = 1,
    Pause = 2,
    Finish = 3,
    Over = 4
}

export enum Direction {
    Up = 1,
    Down = 2,
    Left = 3,
    Right = 4
}

export enum MoveInput {
    RUp = 1,
    RDown = 2,
    RLeft = 3,
    RRight = 4
}

export enum FireInput {
    RFire = 9
}

export enum ServiceInput {
    Escape = 11,
    Enter = 12
}

export enum Player {
    P1 = 1,
    P2 = 2
}

export enum CoinType {
    Standard = 1,
    DeathPlayer1 = 2,
    DeathPlayer2 = 3
    // Large = 4,
    // Super = 5
}

export enum VisualNotifType {
    IncScore = 1,
    DecScore = 2
}

export enum AudioNotifType {
    Coin = 3,
    HitSnake = 4,
    Shoot = 5,
    ShootSnake = 6,
    ShootCoin = 7
}
