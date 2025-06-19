import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'pin',
      name: 'PIN Authentication',
      credentials: {
        userId: { label: "User ID", type: "text" },
        pin: { label: "PIN", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.pin) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { id: credentials.userId }
          })

          if (!user || !user.pin) {
            return null
          }

          const isValidPin = await bcrypt.compare(credentials.pin, user.pin)
          
          if (!isValidPin) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar || user.image,
          }
        } catch (error) {
          console.error('PIN auth error:', error)
          return null
        }
      }
    }),
    CredentialsProvider({
      id: 'demo',
      name: 'Demo Account',
      credentials: {},
      async authorize() {
        // Demo user configuration
        const DEMO_EMAIL = 'demo@teen-budget.app'
        
        try {
          // Check if demo user exists, create if not
          let user = await prisma.user.findUnique({
            where: { email: DEMO_EMAIL }
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: DEMO_EMAIL,
                name: 'Demo User',
                image: null,
              }
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Demo auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
}