'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/currency'

interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  isUnlocked: boolean
  unlockedAt?: string
  progress?: number
  target?: number
  points: number
  category: string
}

interface Goal {
  id: number
  title: string
  target: number
  current: number
  deadline: string
  icon: string
  isCompleted: boolean
}
import { 
  Trophy,
  Target,
  Star,
  Lock,
  CheckCircle,
  TrendingUp,
  PiggyBank,
  Calendar
} from 'lucide-react'

export default function AchievementsPage() {
  // Mock achievements data - will be replaced with real data
  const achievements: Achievement[] = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first transaction',
      icon: '🎯',
      isUnlocked: true,
      unlockedAt: '2024-01-15',
      points: 10,
      category: 'Getting Started'
    },
    {
      id: 2,
      title: 'Budget Master',
      description: 'Stay within budget for a full month',
      icon: '💰',
      isUnlocked: true,
      unlockedAt: '2024-02-01',
      points: 50,
      category: 'Budgeting'
    },
    {
      id: 3,
      title: 'Savings Superstar',
      description: 'Save 100€ in total',
      icon: '⭐',
      isUnlocked: true,
      unlockedAt: '2024-03-10',
      points: 75,
      category: 'Savings'
    },
    {
      id: 4,
      title: 'Category King',
      description: 'Create 5 custom categories',
      icon: '👑',
      isUnlocked: false,
      progress: 3,
      target: 5,
      points: 25,
      category: 'Organization'
    },
    {
      id: 5,
      title: 'Streak Keeper',
      description: 'Log transactions for 7 days straight',
      icon: '🔥',
      isUnlocked: false,
      progress: 4,
      target: 7,
      points: 30,
      category: 'Consistency'
    },
    {
      id: 6,
      title: 'Big Saver',
      description: 'Save 500€ in total',
      icon: '🏆',
      isUnlocked: false,
      progress: 156,
      target: 500,
      points: 100,
      category: 'Savings'
    }
  ]

  const goals: Goal[] = [
    {
      id: 1,
      title: 'New Sneakers',
      target: 120,
      current: 89,
      deadline: '2024-12-31',
      icon: '👟',
      isCompleted: false
    },
    {
      id: 2,
      title: 'Gaming Console',
      target: 299,
      current: 156,
      deadline: '2024-08-15',
      icon: '🎮',
      isCompleted: false
    },
    {
      id: 3,
      title: 'Emergency Fund',
      target: 200,
      current: 200,
      deadline: '2024-06-01',
      icon: '🛡️',
      isCompleted: true
    }
  ]

  const totalPoints = achievements
    .filter((achievement: Achievement) => achievement.isUnlocked)
    .reduce((sum: number, achievement: Achievement) => sum + achievement.points, 0)

  const unlockedCount = achievements.filter((achievement: Achievement) => achievement.isUnlocked).length
  const totalAchievements = achievements.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Goals & Achievements 🏆
          </h1>
          <p className="text-muted-foreground">
            Track your progress and celebrate your wins
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {totalPoints}
            </div>
            <p className="text-xs text-muted-foreground">
              Keep earning more!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unlockedCount}/{totalAchievements}
            </div>
            <p className="text-xs text-muted-foreground">
              {((unlockedCount / totalAchievements) * 100).toFixed(0)}% completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter((goal: Goal) => !goal.isCompleted).length}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PiggyBank className="h-5 w-5" />
            <span>Savings Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {goals.map((goal: Goal) => {
              const progress = (goal.current / goal.target) * 100
              const isCompleted = goal.isCompleted
              
              return (
                <div key={goal.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                        {goal.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                      </p>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {isCompleted ? 'Goal achieved! 🎉' : `${(100 - progress).toFixed(1)}% to go`}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement: Achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border ${
                  achievement.isUnlocked 
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      achievement.isUnlocked ? 'bg-yellow-200' : 'bg-gray-200'
                    }`}>
                      {achievement.isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-400" />}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${achievement.isUnlocked ? 'text-foreground' : 'text-gray-500'}`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${achievement.isUnlocked ? 'text-muted-foreground' : 'text-gray-400'}`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={achievement.isUnlocked ? 'default' : 'secondary'}>
                      {achievement.points} pts
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {achievement.category}
                    </Badge>
                  </div>
                </div>
                
                {achievement.isUnlocked ? (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Unlocked on {new Date(achievement.unlockedAt!).toLocaleDateString()}</span>
                  </div>
                ) : achievement.progress !== undefined ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress} / {achievement.target}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.target!) * 100} 
                      className="h-2"
                    />
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Keep going to unlock this achievement!
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}