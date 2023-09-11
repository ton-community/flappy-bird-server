import { Address } from "@ton/core";
import { Achievement } from "./achievements";

export const config: { tokenMinter: Address, achievementCollections: Record<Achievement, Address> } = {
    tokenMinter: Address.parse('EQBcRUiCkgdfnbnKKYhnPXkNi9BXkq_5uLGRuvnwwaZzelit'),
    achievementCollections: {
        'first-time': Address.parse('EQA5pqs9bqRsW4mXrlUw-SdXv50Grls6UJgu9Mr2v8xKddp6'),
        'five-times': Address.parse('EQB4MbIdtC0ZjcUaYaxqvpSZMYawYdrn-VGpf4xBcM5pYwsi'),
    },
};
