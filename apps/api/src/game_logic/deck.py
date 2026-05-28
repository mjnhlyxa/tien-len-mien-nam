import random
from typing import List
from pydantic import BaseModel
from enum import Enum

class Suit(str, Enum):
    HEARTS = "hearts"
    DIAMONDS = "diamonds"
    CLUBS = "clubs"
    SPADES = "spades"

class Card(BaseModel):
    suit: Suit
    rank: int  # 3-15 (J=11, Q=12, K=13, A=14, 2=15)

def create_deck() -> List[Card]:
    suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
    ranks = list(range(3, 16))  # 3 to 15
    return [Card(suit=s, rank=r) for s in suits for r in ranks]

def shuffle_deck(deck: List[Card]) -> List[Card]:
    shuffled = deck.copy()
    random.shuffle(shuffled)
    return shuffled

def deal_cards(deck: List[Card], player_count: int) -> List[List[Card]]:
    hands = [[] for _ in range(player_count)]
    card_idx = 0
    for round_n in range(13):  # 13 cards each
        for p in range(player_count):
            if card_idx < len(deck):
                hands[p].append(deck[card_idx])
                card_idx += 1
    return hands
