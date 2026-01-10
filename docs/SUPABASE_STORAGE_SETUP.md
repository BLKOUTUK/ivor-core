# Supabase Storage Setup for BLKOUT Shop

## Digital Products Storage Bucket

The shop requires a private Supabase Storage bucket for digital product files (journals, zines, guides, etc.).

### Creating the Bucket

1. **Via Supabase Dashboard** (Recommended):
   - Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets
   - Click "New bucket"
   - Name: `digital-products`
   - Public: **NO** (private bucket for secure downloads)
   - Click "Create bucket"

2. **Via Supabase CLI**:
   ```bash
   npx supabase storage create digital-products --public false
   ```

### Storage Policies (RLS)

Apply these Row Level Security policies to control access:

```sql
-- Allow authenticated users to read files they own via signed URLs
CREATE POLICY "Authenticated users can download via signed URLs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'digital-products');

-- Allow service role to upload files (for admin/backend)
CREATE POLICY "Service role can upload digital products"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'digital-products');

-- Allow service role to update files
CREATE POLICY "Service role can update digital products"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'digital-products');

-- Allow service role to delete files
CREATE POLICY "Service role can delete digital products"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'digital-products');
```

### File Structure

Organize files in the bucket as follows:

```
digital-products/
├── journals/
│   ├── blkout-liberation-journal-digital.pdf
│   └── blkout-liberation-journal-digital-fillable.pdf
├── zines/
│   ├── black-queer-joy-zine-issue-1.pdf
│   └── black-queer-joy-zine-issue-2.pdf
├── guides/
│   └── community-organizing-guide.pdf
└── audio/
    └── meditation-series-ep1.mp3
```

### Uploading Digital Products

**Via Dashboard**:
1. Go to Storage > digital-products bucket
2. Click "Upload file"
3. Select your file
4. Note the file path (e.g., `journals/blkout-liberation-journal-digital.pdf`)
5. Update the product in the database with this path

**Via Backend (Recommended for production)**:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function uploadDigitalProduct(filePath: string, fileBuffer: Buffer) {
  const { data, error } = await supabase.storage
    .from('digital-products')
    .upload(filePath, fileBuffer, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  return data.path
}

// Update product with file URL
await supabase
  .from('shop_products')
  .update({ file_url: 'journals/blkout-liberation-journal-digital.pdf' })
  .eq('slug', 'blkout-liberation-journal-digital')
```

### Generating Signed URLs

The `JournalService.generateDownloadUrl()` method automatically creates time-limited signed URLs:

```typescript
// Generate 5-minute signed URL
const { data: signedUrl } = await supabase.storage
  .from('digital-products')
  .createSignedUrl('journals/blkout-liberation-journal-digital.pdf', 300)

console.log(signedUrl.signedUrl) // User can download from this URL for 5 minutes
```

### Security Considerations

1. **Never expose file URLs directly** - Always use signed URLs
2. **Validate download tokens** - Check user ownership and expiration
3. **Limit download counts** - Default is 5 downloads per purchase
4. **Set appropriate expiration** - Digital purchases expire after 30 days (configurable)
5. **Log all downloads** - Track via `shop_downloads` table for security auditing

### Testing

After setup, test the complete flow:

1. Upload a test PDF to `digital-products/test/sample.pdf`
2. Create a test order with a digital product
3. Generate a download token via `JournalService.claimMemberJournal()` or checkout
4. Call the download endpoint: `GET /api/shop/download/:token`
5. Verify the signed URL is generated and file downloads successfully

### Monitoring

Check bucket usage in Supabase Dashboard:
- **Storage > digital-products**
- Monitor file count and total size
- Review access logs for unusual patterns
- Set up alerts for storage quota approaching limits

### Backup Strategy

1. **Manual backup**: Download all files from bucket periodically
2. **Automated backup**: Use Supabase backups (included in Pro plan)
3. **External backup**: Sync files to S3/CloudFlare R2 for redundancy

---

**Next Steps**: Once the bucket is created and policies applied, upload your first digital products and test the download flow end-to-end.
