const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

const DSAProblem = require("../models/DSAProblem");
const connectDB = require("../config/db");

const problems = [
  // 1. ARRAYS - Easy
  {
    problemNumber: 1,
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hashing"],
    sheetCategory: "Beginner",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "nums[1] + nums[2] == 6, we return [1, 2].",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "nums[0] + nums[1] == 6, we return [0, 1].",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    followUp: "Can you come up with an algorithm that is less than O(n^2) time complexity?",
    functionName: "twoSum",
    parameters: [
      { name: "nums", type: "number[]" },
      { name: "target", type: "number" },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  
}`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your code here
        pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};`,
    },
    sampleTestCases: [
      { input: "[[2,7,11,15], 9]", expectedOutput: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "[[3,2,4], 6]", expectedOutput: "[1,2]", explanation: "nums[1] + nums[2] = 2 + 4 = 6" },
      { input: "[[3,3], 6]", expectedOutput: "[0,1]", explanation: "nums[0] + nums[1] = 3 + 3 = 6" },
    ],
    hiddenTestCases: [
      { input: "[[1,5,8,3], 11]", expectedOutput: "[2,3]" },
      { input: "[[-1,-2,-3,-4,-5], -8]", expectedOutput: "[2,4]" },
      { input: "[[100,200,300,400], 700]", expectedOutput: "[2,3]" },
    ],
    order: 1,
  },

  // 2. STRINGS - Easy
  {
    problemNumber: 2,
    title: "Valid Palindrome",
    slug: "valid-palindrome",
    difficulty: "Easy",
    topics: ["Strings", "Two Pointers"],
    sheetCategory: "Beginner",
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 's = "race a car"',
        output: "false",
        explanation: '"raceacar" is not a palindrome.',
      },
      {
        input: 's = " "',
        output: "true",
        explanation: 's is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.',
      },
    ],
    constraints: [
      "1 <= s.length <= 2 * 10^5",
      "s consists only of printable ASCII characters.",
    ],
    followUp: "Can you solve it in O(1) auxiliary space?",
    functionName: "isPalindrome",
    parameters: [{ name: "s", type: "string" }],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Write your code here
  
}`,
      python: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Write your code here
        pass`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        // Write your code here
        return false;
    }
}`,
      cpp: `#include <string>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        // Write your code here
        return false;
    }
};`,
    },
    sampleTestCases: [
      { input: '["A man, a plan, a canal: Panama"]', expectedOutput: "true" },
      { input: '["race a car"]', expectedOutput: "false" },
      { input: '[" "]', expectedOutput: "true" },
    ],
    hiddenTestCases: [
      { input: '["0P"]', expectedOutput: "false" },
      { input: '["ab_a"]', expectedOutput: "true" },
      { input: '["Madam, I\'m Adam"]', expectedOutput: "true" },
    ],
    order: 2,
  },

  // 3. HASHING - Easy
  {
    problemNumber: 3,
    title: "Contains Duplicate",
    slug: "contains-duplicate",
    difficulty: "Easy",
    topics: ["Hashing", "Arrays"],
    sheetCategory: "Beginner",
    description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.`,
    examples: [
      { input: "nums = [1,2,3,1]", output: "true", explanation: "1 appears twice." },
      { input: "nums = [1,2,3,4]", output: "false", explanation: "All elements are distinct." },
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true", explanation: "Multiple duplicates exist." },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    followUp: "Can you achieve O(n) runtime?",
    functionName: "containsDuplicate",
    parameters: [{ name: "nums", type: "number[]" }],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
  // Write your code here
  
}`,
      python: `class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        # Write your code here
        pass`,
      java: `import java.util.HashSet;

class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Write your code here
        return false;
    }
}`,
      cpp: `#include <vector>
#include <unordered_set>
using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        // Write your code here
        return false;
    }
};`,
    },
    sampleTestCases: [
      { input: "[[1,2,3,1]]", expectedOutput: "true" },
      { input: "[[1,2,3,4]]", expectedOutput: "false" },
      { input: "[[1,1,1,3,3,4,3,2,4,2]]", expectedOutput: "true" },
    ],
    hiddenTestCases: [
      { input: "[[5]]", expectedOutput: "false" },
      { input: "[[99,99]]", expectedOutput: "true" },
      { input: "[[10,20,30,40,50,60,70,80,90,10]]", expectedOutput: "true" },
    ],
    order: 3,
  },

  // 4. TWO POINTERS - Medium
  {
    problemNumber: 4,
    title: "Container With Most Water",
    slug: "container-with-most-water",
    difficulty: "Medium",
    topics: ["Two Pointers", "Arrays", "Greedy"],
    sheetCategory: "Advanced",
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.

**Notice** that you may not slant the container.`,
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation: "The vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (between index 1 and 8) the container can contain is 49.",
      },
      {
        input: "height = [1,1]",
        output: "1",
        explanation: "1 * 1 = 1",
      },
    ],
    constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    followUp: "Can you achieve O(n) time using two pointers?",
    functionName: "maxArea",
    parameters: [{ name: "height", type: "number[]" }],
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // Write your code here
  
}`,
      python: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int maxArea(int[] height) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        // Write your code here
        return 0;
    }
};`,
    },
    sampleTestCases: [
      { input: "[[1,8,6,2,5,4,8,3,7]]", expectedOutput: "49" },
      { input: "[[1,1]]", expectedOutput: "1" },
    ],
    hiddenTestCases: [
      { input: "[[4,3,2,1,4]]", expectedOutput: "16" },
      { input: "[[1,2,1]]", expectedOutput: "2" },
      { input: "[[2,3,4,5,18,17,6]]", expectedOutput: "17" },
    ],
    order: 4,
  },

  // 5. SLIDING WINDOW - Medium
  {
    problemNumber: 5,
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    topics: ["Sliding Window", "Strings", "Hashing"],
    sheetCategory: "Advanced",
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with the length of 3.' },
    ],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    followUp: "Can you maintain indices in a hash map to avoid redundant increments?",
    functionName: "lengthOfLongestSubstring",
    parameters: [{ name: "s", type: "string" }],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your code here
  
}`,
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `#include <string>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your code here
        return 0;
    }
};`,
    },
    sampleTestCases: [
      { input: '["abcabcbb"]', expectedOutput: "3" },
      { input: '["bbbbb"]', expectedOutput: "1" },
      { input: '["pwwkew"]', expectedOutput: "3" },
    ],
    hiddenTestCases: [
      { input: '[""]', expectedOutput: "0" },
      { input: '["dvdf"]', expectedOutput: "3" },
      { input: '["tmmzuxt"]', expectedOutput: "5" },
    ],
    order: 5,
  },

  // 6. STACK - Easy
  {
    problemNumber: 6,
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy",
    topics: ["Stack", "Strings"],
    sheetCategory: "Intermediate",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    followUp: "Can you solve it in O(n) time and O(n) space?",
    functionName: "isValid",
    parameters: [{ name: "s", type: "string" }],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your code here
  
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your code here
        pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your code here
        return false;
    }
}`,
      cpp: `#include <string>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Write your code here
        return false;
    }
};`,
    },
    sampleTestCases: [
      { input: '["()"]', expectedOutput: "true" },
      { input: '["()[]{}"]', expectedOutput: "true" },
      { input: '["(]"]', expectedOutput: "false" },
    ],
    hiddenTestCases: [
      { input: '["([)]"]', expectedOutput: "false" },
      { input: '["{[]}"]', expectedOutput: "true" },
      { input: '["["]', expectedOutput: "false" },
    ],
    order: 6,
  },

  // 7. BINARY SEARCH - Easy
  {
    problemNumber: 7,
    title: "Binary Search",
    slug: "binary-search",
    difficulty: "Easy",
    topics: ["Binary Search", "Arrays"],
    sheetCategory: "Beginner",
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists in nums and its index is 4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "2 does not exist in nums so return -1" },
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    followUp: "Ensure mid calculation avoids integer overflow.",
    functionName: "search",
    parameters: [
      { name: "nums", type: "number[]" },
      { name: "target", type: "number" },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Write your code here
  
}`,
      python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Write your code here
        return -1;
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Write your code here
        return -1;
    }
};`,
    },
    sampleTestCases: [
      { input: "[[-1,0,3,5,9,12], 9]", expectedOutput: "4" },
      { input: "[[-1,0,3,5,9,12], 2]", expectedOutput: "-1" },
    ],
    hiddenTestCases: [
      { input: "[[5], 5]", expectedOutput: "0" },
      { input: "[[5], -5]", expectedOutput: "-1" },
      { input: "[[2,5], 5]", expectedOutput: "1" },
    ],
    order: 7,
  },

  // 8. DYNAMIC PROGRAMMING - Easy
  {
    problemNumber: 8,
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    difficulty: "Easy",
    topics: ["Dynamic Programming", "Recursion"],
    sheetCategory: "Advanced",
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: "n = 2", output: "2", explanation: "There are two ways: 1 step + 1 step, or 2 steps." },
      { input: "n = 3", output: "3", explanation: "There are three ways: 1+1+1, 1+2, or 2+1." },
    ],
    constraints: ["1 <= n <= 45"],
    followUp: "Can you optimize space to O(1)?",
    functionName: "climbStairs",
    parameters: [{ name: "n", type: "number" }],
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Write your code here
  
}`,
      python: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Write your code here
        return 0;
    }
};`,
    },
    sampleTestCases: [
      { input: "[2]", expectedOutput: "2" },
      { input: "[3]", expectedOutput: "3" },
    ],
    hiddenTestCases: [
      { input: "[1]", expectedOutput: "1" },
      { input: "[4]", expectedOutput: "5" },
      { input: "[5]", expectedOutput: "8" },
      { input: "[10]", expectedOutput: "89" },
    ],
    order: 8,
  },

  // 9. DYNAMIC PROGRAMMING - Medium
  {
    problemNumber: 9,
    title: "Coin Change",
    slug: "coin-change",
    difficulty: "Medium",
    topics: ["Dynamic Programming", "Greedy"],
    sheetCategory: "Advanced",
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    examples: [
      { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" },
    ],
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    followUp: "Can you identify why a greedy choice does not always yield the optimal coin combination?",
    functionName: "coinChange",
    parameters: [
      { name: "coins", type: "number[]" },
      { name: "amount", type: "number" },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // Write your code here
  
}`,
      python: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        // Write your code here
        return -1;
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // Write your code here
        return -1;
    }
};`,
    },
    sampleTestCases: [
      { input: "[[1,2,5], 11]", expectedOutput: "3" },
      { input: "[[2], 3]", expectedOutput: "-1" },
      { input: "[[1], 0]", expectedOutput: "0" },
    ],
    hiddenTestCases: [
      { input: "[[1,5,10,25], 30]", expectedOutput: "2" },
      { input: "[[2,5,10,1], 27]", expectedOutput: "4" },
      { input: "[[186,419,83,408], 6249]", expectedOutput: "20" },
    ],
    order: 9,
  },

  // 10. BIT MANIPULATION - Easy
  {
    problemNumber: 10,
    title: "Single Number",
    slug: "single-number",
    difficulty: "Easy",
    topics: ["Bit Manipulation", "Arrays"],
    sheetCategory: "Advanced",
    description: `Given a **non-empty** array of integers \`nums\`, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.`,
    examples: [
      { input: "nums = [2,2,1]", output: "1" },
      { input: "nums = [4,1,2,1,2]", output: "4" },
      { input: "nums = [1]", output: "1" },
    ],
    constraints: [
      "1 <= nums.length <= 3 * 10^4",
      "-3 * 10^4 <= nums[i] <= 3 * 10^4",
      "Each element in the array appears twice except for one element which appears only once.",
    ],
    followUp: "Can you utilize the XOR bitwise operator's self-canceling properties?",
    functionName: "singleNumber",
    parameters: [{ name: "nums", type: "number[]" }],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function singleNumber(nums) {
  // Write your code here
  
}`,
      python: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int singleNumber(int[] nums) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int singleNumber(vector<int>& nums) {
        // Write your code here
        return 0;
    }
};`,
    },
    sampleTestCases: [
      { input: "[[2,2,1]]", expectedOutput: "1" },
      { input: "[[4,1,2,1,2]]", expectedOutput: "4" },
      { input: "[[1]]", expectedOutput: "1" },
    ],
    hiddenTestCases: [
      { input: "[[-1,-1,-2]]", expectedOutput: "-2" },
      { input: "[[10,20,30,20,10]]", expectedOutput: "30" },
    ],
    order: 10,
  },

  // 11. SORTING - Medium
  {
    problemNumber: 11,
    title: "Merge Intervals",
    slug: "merge-intervals",
    difficulty: "Medium",
    topics: ["Sorting", "Arrays"],
    sheetCategory: "Beginner",
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.`,
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6].",
      },
      {
        input: "intervals = [[1,4],[4,5]]",
        output: "[[1,5]]",
        explanation: "Intervals [1,4] and [4,5] are considered overlapping.",
      },
    ],
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start_i <= end_i <= 10^4",
    ],
    followUp: "Can you sort by start times and merge in a single linear pass?",
    functionName: "merge",
    parameters: [{ name: "intervals", type: "number[][]" }],
    starterCode: {
      javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  // Write your code here
  
}`,
      python: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        # Write your code here
        pass`,
      java: `class Solution {
    public int[][] merge(int[][] intervals) {
        // Write your code here
        return new int[][]{};
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // Write your code here
        return {};
    }
};`,
    },
    sampleTestCases: [
      { input: "[[[1,3],[2,6],[8,10],[15,18]]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
      { input: "[[[1,4],[4,5]]]", expectedOutput: "[[1,5]]" },
    ],
    hiddenTestCases: [
      { input: "[[[1,4],[0,4]]]", expectedOutput: "[[0,4]]" },
      { input: "[[[1,4],[2,3]]]", expectedOutput: "[[1,4]]" },
      { input: "[[[2,3],[4,5],[6,7],[8,9],[1,10]]]", expectedOutput: "[[1,10]]" },
    ],
    order: 11,
  },

  // 12. BACKTRACKING - Medium
  {
    problemNumber: 12,
    title: "Subsets",
    slug: "subsets",
    difficulty: "Medium",
    topics: ["Backtracking", "Recursion", "Bit Manipulation"],
    sheetCategory: "Advanced",
    description: `Given an integer array \`nums\` of **unique** elements, return *all possible subsets (the power set)*.

The solution set **must not** contain duplicate subsets. Return the solution in **any order**.`,
    examples: [
      {
        input: "nums = [1,2,3]",
        output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
        explanation: "All 8 subsets of [1,2,3]",
      },
      {
        input: "nums = [0]",
        output: "[[],[0]]",
      },
    ],
    constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "All the numbers of nums are unique."],
    followUp: "Can you generate subsets iteratively using bitmasks?",
    functionName: "subsets",
    parameters: [{ name: "nums", type: "number[]" }],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function subsets(nums) {
  // Write your code here
  
}`,
      python: `class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        # Write your code here
        pass`,
      java: `import java.util.List;

class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        // Write your code here
        return null;
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        // Write your code here
        return {};
    }
};`,
    },
    sampleTestCases: [
      { input: "[[1,2,3]]", expectedOutput: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]" },
      { input: "[[0]]", expectedOutput: "[[],[0]]" },
    ],
    hiddenTestCases: [
      { input: "[[1,2]]", expectedOutput: "[[],[1],[2],[1,2]]" },
      { input: "[[9]]", expectedOutput: "[[],[9]]" },
    ],
    order: 12,
  },

  // 13. LINKED LIST - Easy
  {
    problemNumber: 13,
    title: "Reverse Linked List",
    slug: "reverse-linked-list",
    difficulty: "Easy",
    topics: ["Linked List", "Recursion"],
    sheetCategory: "Intermediate",
    description: `Given the \`head\` of a singly linked list represented as an array of values, reverse the list, and return *the reversed list*.`,
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: ["The number of nodes in the list is the range [0, 5000].", "-5000 <= Node.val <= 5000"],
    followUp: "A linked list can be reversed either iteratively or recursively. Could you implement both?",
    functionName: "reverseList",
    parameters: [{ name: "head", type: "number[]" }],
    starterCode: {
      javascript: `/**
 * @param {number[]} head
 * @return {number[]}
 */
function reverseList(head) {
  // Write your code here
  
}`,
      python: `class Solution:
    def reverseList(self, head: list[int]) -> list[int]:
        # Write your code here
        pass`,
      java: `class Solution {
    public int[] reverseList(int[] head) {
        // Write your code here
        return new int[]{};
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> reverseList(vector<int>& head) {
        // Write your code here
        return {};
    }
};`,
    },
    sampleTestCases: [
      { input: "[[1,2,3,4,5]]", expectedOutput: "[5,4,3,2,1]" },
      { input: "[[1,2]]", expectedOutput: "[2,1]" },
      { input: "[[]]", expectedOutput: "[]" },
    ],
    hiddenTestCases: [
      { input: "[[7]]", expectedOutput: "[7]" },
      { input: "[[10,20,30]]", expectedOutput: "[30,20,10]" },
    ],
    order: 13,
  },

  // 14. HEAP - Medium
  {
    problemNumber: 14,
    title: "Kth Largest Element in an Array",
    slug: "kth-largest-element-in-an-array",
    difficulty: "Medium",
    topics: ["Heap", "Sorting", "Arrays"],
    sheetCategory: "Intermediate",
    description: `Given an integer array \`nums\` and an integer \`k\`, return *the \`k-th\` largest element in the array*.

Note that it is the \`k-th\` largest element in the sorted order, not the \`k-th\` distinct element.

Can you solve it without sorting?`,
    examples: [
      { input: "nums = [3,2,1,5,6,4], k = 2", output: "5" },
      { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4" },
    ],
    constraints: ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    followUp: "Can you achieve O(n) average time complexity using QuickSelect or Min-Heap?",
    functionName: "findKthLargest",
    parameters: [
      { name: "nums", type: "number[]" },
      { name: "k", type: "number" },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function findKthLargest(nums, k) {
  // Write your code here
  
}`,
      python: `class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        // Write your code here
        return 0;
    }
};`,
    },
    sampleTestCases: [
      { input: "[[3,2,1,5,6,4], 2]", expectedOutput: "5" },
      { input: "[[3,2,3,1,2,4,5,5,6], 4]", expectedOutput: "4" },
    ],
    hiddenTestCases: [
      { input: "[[1], 1]", expectedOutput: "1" },
      { input: "[[7,6,5,4,3,2,1], 5]", expectedOutput: "3" },
      { input: "[[99,99,99,99], 1]", expectedOutput: "99" },
    ],
    order: 14,
  },

  // 15. GRAPH - Medium
  {
    problemNumber: 15,
    title: "Number of Islands",
    slug: "number-of-islands",
    difficulty: "Medium",
    topics: ["Graph", "Recursion", "Queue"],
    sheetCategory: "Intermediate",
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    examples: [
      {
        input: `grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]`,
        output: "1",
      },
      {
        input: `grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]`,
        output: "3",
      },
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'.",
    ],
    followUp: "Can you solve it using both DFS and BFS traversals?",
    functionName: "numIslands",
    parameters: [{ name: "grid", type: "string[][]" }],
    starterCode: {
      javascript: `/**
 * @param {string[][]} grid
 * @return {number}
 */
function numIslands(grid) {
  // Write your code here
  
}`,
      python: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int numIslands(char[][] grid) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        // Write your code here
        return 0;
    }
};`,
    },
    sampleTestCases: [
      {
        input: '[[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]]',
        expectedOutput: "1",
      },
      {
        input: '[[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]]',
        expectedOutput: "3",
      },
    ],
    hiddenTestCases: [
      { input: '[[["1"]]]', expectedOutput: "1" },
      { input: '[[["0"]]]', expectedOutput: "0" },
      { input: '[[["1","0","1"],["0","1","0"],["1","0","1"]]]', expectedOutput: "5" },
    ],
    order: 15,
  },

  // 16. TREES - Easy
  {
    problemNumber: 16,
    title: "Maximum Depth of Binary Tree",
    slug: "maximum-depth-of-binary-tree",
    difficulty: "Easy",
    topics: ["Trees", "Recursion", "Queue"],
    sheetCategory: "Intermediate",
    description: `Given the \`root\` of a binary tree represented as level-order array values where \`null\` represents absent nodes, return *its maximum depth*.

A binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "3" },
      { input: "root = [1,null,2]", output: "2" },
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"],
    followUp: "Can you solve it iteratively using BFS level-order traversal?",
    functionName: "maxDepth",
    parameters: [{ name: "root", type: "(number|null)[]" }],
    starterCode: {
      javascript: `/**
 * @param {(number|null)[]} root
 * @return {number}
 */
function maxDepth(root) {
  // Write your code here
  
}`,
      python: `class Solution:
    def maxDepth(self, root: list) -> int:
        # Write your code here
        pass`,
      java: `class Solution {
    public int maxDepth(Integer[] root) {
        // Write your code here
        return 0;
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int maxDepth(vector<int>& root) {
        // Write your code here
        return 0;
    }
};`,
    },
    sampleTestCases: [
      { input: "[[3,9,20,null,null,15,7]]", expectedOutput: "3" },
      { input: "[[1,null,2]]", expectedOutput: "2" },
    ],
    hiddenTestCases: [
      { input: "[[]]", expectedOutput: "0" },
      { input: "[[0]]", expectedOutput: "1" },
      { input: "[[1,2,3,4,5]]", expectedOutput: "3" },
    ],
    order: 16,
  },

  // 17. BST - Medium
  {
    problemNumber: 17,
    title: "Validate Binary Search Tree",
    slug: "validate-binary-search-tree",
    difficulty: "Medium",
    topics: ["BST", "Trees", "Recursion"],
    sheetCategory: "Intermediate",
    description: `Given the \`root\` of a binary tree represented as level-order array values, determine if it is a valid binary search tree (BST).

A **valid BST** is defined as follows:
- The left subtree of a node contains only nodes with keys **less than** the node's key.
- The right subtree of a node contains only nodes with keys **greater than** the node's key.
- Both the left and right subtrees must also be binary search trees.`,
    examples: [
      { input: "root = [2,1,3]", output: "true" },
      { input: "root = [5,1,4,null,null,3,6]", output: "false", explanation: "The root node's value is 5 but its right child's value is 4." },
    ],
    constraints: ["The number of nodes in the tree is in the range [1, 10^4].", "-2^31 <= Node.val <= 2^31 - 1"],
    followUp: "Can you validate by checking if in-order traversal produces a strictly increasing sequence?",
    functionName: "isValidBST",
    parameters: [{ name: "root", type: "(number|null)[]" }],
    starterCode: {
      javascript: `/**
 * @param {(number|null)[]} root
 * @return {boolean}
 */
function isValidBST(root) {
  // Write your code here
  
}`,
      python: `class Solution:
    def isValidBST(self, root: list) -> bool:
        # Write your code here
        pass`,
      java: `class Solution {
    public boolean isValidBST(Integer[] root) {
        // Write your code here
        return false;
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    bool isValidBST(vector<int>& root) {
        // Write your code here
        return false;
    }
};`,
    },
    sampleTestCases: [
      { input: "[[2,1,3]]", expectedOutput: "true" },
      { input: "[[5,1,4,null,null,3,6]]", expectedOutput: "false" },
    ],
    hiddenTestCases: [
      { input: "[[10,5,15,null,null,6,20]]", expectedOutput: "false" },
      { input: "[[1]]", expectedOutput: "true" },
      { input: "[[2,2,2]]", expectedOutput: "false" },
    ],
    order: 17,
  },

  // 18. QUEUE - Easy
  {
    problemNumber: 18,
    title: "Implement Queue using Stacks",
    slug: "implement-queue-using-stacks",
    difficulty: "Easy",
    topics: ["Queue", "Stack"],
    sheetCategory: "Intermediate",
    description: `Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (\`push\`, \`peek\`, \`pop\`, and \`empty\`).

Simulate an array of command operations:
Given operations array \`operations\` and arguments \`args\`, perform the operations and return the array of results (\`null\` for push, returned value for pop/peek/empty).`,
    examples: [
      {
        input: 'operations = ["push","push","peek","pop","empty"], args = [[1],[2],[],[],[]]',
        output: "[null,null,1,1,false]",
      },
    ],
    constraints: ["1 <= operations.length <= 100", "At most 100 calls will be made."],
    followUp: "Can you implement the queue such that each operation is amortized O(1) time complexity?",
    functionName: "simulateQueue",
    parameters: [
      { name: "operations", type: "string[]" },
      { name: "args", type: "any[][]" },
    ],
    starterCode: {
      javascript: `/**
 * @param {string[]} operations
 * @param {any[][]} args
 * @return {any[]}
 */
function simulateQueue(operations, args) {
  // Write your code here
  
}`,
      python: `class Solution:
    def simulateQueue(self, operations: list[str], args: list) -> list:
        # Write your code here
        pass`,
      java: `class Solution {
    public Object[] simulateQueue(String[] operations, Object[][] args) {
        // Write your code here
        return new Object[]{};
    }
}`,
      cpp: `#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    vector<string> simulateQueue(vector<string>& operations, vector<vector<int>>& args) {
        // Write your code here
        return {};
    }
};`,
    },
    sampleTestCases: [
      {
        input: '[["push","push","peek","pop","empty"], [[1],[2],[],[],[]]]',
        expectedOutput: "[null,null,1,1,false]",
      },
    ],
    hiddenTestCases: [
      {
        input: '[["push","pop","empty"], [[10],[],[]]]',
        expectedOutput: "[null,10,true]",
      },
    ],
    order: 18,
  },

  // 19. GREEDY - Medium
  {
    problemNumber: 19,
    title: "Jump Game",
    slug: "jump-game",
    difficulty: "Medium",
    topics: ["Greedy", "Dynamic Programming", "Arrays"],
    sheetCategory: "Advanced",
    description: `You are given an integer array \`nums\`. You are initially positioned at the array's **first index**, and each element in the array represents your maximum jump length at that position.

Return \`true\` *if you can reach the last index, or* \`false\` *otherwise*.`,
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "true", explanation: "Jump 1 step from index 0 to 1, then 3 steps to the last index." },
      { input: "nums = [3,2,1,0,4]", output: "false", explanation: "You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index." },
    ],
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
    followUp: "Can you solve it in O(n) time and O(1) extra space by keeping track of the furthest reachable index?",
    functionName: "canJump",
    parameters: [{ name: "nums", type: "number[]" }],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function canJump(nums) {
  // Write your code here
  
}`,
      python: `class Solution:
    def canJump(self, nums: list[int]) -> bool:
        # Write your code here
        pass`,
      java: `class Solution {
    public boolean canJump(int[] nums) {
        // Write your code here
        return false;
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    bool canJump(vector<int>& nums) {
        // Write your code here
        return false;
    }
};`,
    },
    sampleTestCases: [
      { input: "[[2,3,1,1,4]]", expectedOutput: "true" },
      { input: "[[3,2,1,0,4]]", expectedOutput: "false" },
    ],
    hiddenTestCases: [
      { input: "[[0]]", expectedOutput: "true" },
      { input: "[[2,0,0]]", expectedOutput: "true" },
      { input: "[[1,0,1,0]]", expectedOutput: "false" },
    ],
    order: 19,
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB for DSA seeding...");

    for (const prob of problems) {
      await DSAProblem.findOneAndUpdate(
        { slug: prob.slug },
        { ...prob },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Upserted problem #${prob.problemNumber}: ${prob.title} [${prob.difficulty}]`);
    }

    console.log(`\nSuccessfully seeded ${problems.length} DSA problems across all 19 topics!`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding DSA problems:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { problems, seed };
