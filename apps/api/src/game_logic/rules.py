from typing import List, Optional, Tuple
from src.game_logic.deck import Card, Suit

CombinationType = str  # "single", "pair", "triple", "straight", "full_house", "bomb"

def validate_combination(cards: List[Card]) -> Tuple[bool, Optional[CombinationType], Optional[int], Optional[str]]:
    if not cards:
        return False, None, None, "Không có bài được chọn"

    if len(cards) == 1:
        return True, "single", cards[0].rank, None

    # Sort by rank
    sorted_cards = sorted(cards, key=lambda c: c.rank)
    ranks = [c.rank for c in sorted_cards]
    suits = [c.suit for c in cards]
    unique_ranks = list(set(ranks))
    unique_suits = list(set(suits))

    # Pair (2 cards, same rank)
    if len(cards) == 2 and len(unique_ranks) == 1:
        return True, "pair", unique_ranks[0], None

    # Triple (3 cards, same rank)
    if len(cards) == 3 and len(unique_ranks) == 1:
        return True, "triple", unique_ranks[0], None

    # Bomb (4 cards, same rank)
    if len(cards) == 4 and len(unique_ranks) == 1:
        return True, "bomb", unique_ranks[0], None

    # Straight (3+ consecutive cards, same suit)
    if len(cards) >= 3 and len(unique_suits) == 1:
        is_consecutive = check_consecutive(ranks)
        if is_consecutive:
            # Check no 2 in straight (A-2-3 invalid)
            if 15 in ranks and 3 in ranks and len(cards) == 3:
                return False, None, None, "A-2-3 không hợp lệ"
            return True, "straight", max(ranks), None

    # Full House (3 + 2)
    if len(cards) == 5:
        rank_counts = {}
        for r in ranks:
            rank_counts[r] = rank_counts.get(r, 0) + 1
        counts = sorted(rank_counts.values(), reverse=True)
        if counts[0] == 3 and counts[1] == 2:
            triple_rank = [r for r, c in rank_counts.items() if c == 3][0]
            return True, "full_house", triple_rank, None

    return False, None, None, "Bộ bài không hợp lệ"

def check_consecutive(ranks: List[int]) -> bool:
    sorted_ranks = sorted(ranks)
    for i in range(1, len(sorted_ranks)):
        if sorted_ranks[i] != sorted_ranks[i-1] + 1:
            return False
    return True

def can_beat(new_cards: List[Card], last_combo_type: str, last_rank: int, last_length: int) -> Tuple[bool, Optional[str]]:
    is_valid, combo_type, rank, error = validate_combination(new_cards)
    if not is_valid:
        return False, error

    # Bomb beats everything
    if combo_type == "bomb" and last_combo_type != "bomb":
        return True, None

    # Non-bomb cannot beat bomb
    if combo_type != "bomb" and last_combo_type == "bomb":
        return False, "Phải đánh tứ quý để chặn tứ quý"

    # Must be same type
    if combo_type != last_combo_type:
        return False, "Phải đánh cùng loại bộ bài"

    # For straight, longer wins
    if combo_type == "straight":
        if len(new_cards) > last_length:
            return True, None
        if len(new_cards) < last_length:
            return False, "Sảnh dài hơn thắng sảnh ngắn hơn"

    # Rank must be higher
    rank_value = get_rank_value(rank)
    last_rank_value = get_rank_value(last_rank)
    if rank_value <= last_rank_value:
        return False, "Bộ bài không đủ mạnh để chặn"

    return True, None

def get_rank_value(rank: int) -> int:
    # 3=1, 4=2, ..., K=11, A=12, 2=13
    return rank - 2  # So 3 becomes 1

def must_play_three_diamonds(cards: List[Card], has_started: bool) -> bool:
    if has_started:
        return False
    return any(c.suit == Suit.DIAMONDS and c.rank == 3 for c in cards)
