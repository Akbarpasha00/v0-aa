# Azure AD Setup for Secure Login

## 1. Create Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: Placement CMS
   - **Supported account types**: Accounts in any organizational directory (Any Azure AD directory - Multitenant)
   - **Redirect URI**: Web - `https://agilevu.com/auth/callback`

## 2. Configure Authentication

1. In your app registration, go to **Authentication**
2. Add these redirect URIs:
   - `https://agilevu.com/auth/callback`
   - `https://dashboard.agilevu.com/auth/callback`
3. Enable **ID tokens** under Implicit grant and hybrid flows
4. Set **Logout URL**: `https://agilevu.com/login`

## 3. Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: "Placement CMS Secret"
4. Set expiration: 24 months
5. **Copy the secret value** (you won't see it again!)

## 4. Configure API Permissions

1. Go to **API permissions**
2. Add these Microsoft Graph permissions:
   - `User.Read` (Delegated)
   - `openid` (Delegated)
   - `profile` (Delegated)
   - `email` (Delegated)

## 5. Get Required Values

Copy these values for your environment variables:

- **Application (client) ID**: Found in Overview
- **Directory (tenant) ID**: Found in Overview  
- **Client Secret**: The secret you created

## 6. Set Environment Variables in Cloudflare

In your Cloudflare Workers dashboard, set these environment variables:

\`\`\`
JWT_SECRET=your-random-jwt-secret-here
MICROSOFT_CLIENT_ID=your-client-id-here
MICROSOFT_CLIENT_SECRET=your-client-secret-here
MICROSOFT_TENANT_ID=your-tenant-id-or-common
REDIRECT_URI=https://agilevu.com/auth/callback
\`\`\`

## 7. DNS Configuration

Set up these DNS records in Cloudflare:

\`\`\`
Type: CNAME
Name: dashboard
Content: agilevu.com
Proxy: Enabled (Orange cloud)
\`\`\`

## 8. Test the Setup

1. Visit `https://agilevu.com`
2. Click "Continue with Microsoft"
3. Complete Microsoft authentication
4. You should be redirected to `https://dashboard.agilevu.com/dashboard`

## Security Features

✅ **Microsoft Authenticator Required**
✅ **Multi-Factor Authentication**
✅ **Azure AD Integration**
✅ **JWT Token Security**
✅ **Subdomain Isolation**
✅ **Secure Cookie Handling**
✅ **Session Management**
