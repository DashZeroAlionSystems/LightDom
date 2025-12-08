# StoryMiner Data Directory

Generated artifacts are written to this tree using the hierarchy defined in the styleguide schema:

```
{batchId}/
  raw/               # unprocessed responses, HTML snapshots
  processed/
    screenshots/
    stories/
    layers/
    metadata/
    models/
      checkpoints/
```

Large files should be stored outside the git repository (e.g., object storage). Use symbolic links or environment configuration to point to the external volume in production environments.
