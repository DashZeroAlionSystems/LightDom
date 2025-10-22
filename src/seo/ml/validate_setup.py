#!/usr/bin/env python3
"""
SEO AI Model - Setup Validation Script
Validates that all dependencies, configurations, and components are correctly installed
"""

import sys
import importlib
from typing import Dict, List, Tuple

class SetupValidator:
    def __init__(self):
        self.results: List[Tuple[str, bool, str]] = []

    def check_dependency(self, package: str, min_version: str = None) -> bool:
        """Check if a Python package is installed"""
        try:
            module = importlib.import_module(package)
            version = getattr(module, '__version__', 'unknown')

            if min_version and version != 'unknown':
                # Simple version comparison (works for most cases)
                installed_ver = tuple(map(int, version.split('.')[:2]))
                required_ver = tuple(map(int, min_version.split('.')[:2]))

                if installed_ver >= required_ver:
                    self.results.append((package, True, f"✓ {version} (>= {min_version})"))
                    return True
                else:
                    self.results.append((package, False, f"✗ {version} (need >= {min_version})"))
                    return False
            else:
                self.results.append((package, True, f"✓ {version}"))
                return True

        except ImportError:
            self.results.append((package, False, "✗ Not installed"))
            return False

    def check_file_exists(self, filepath: str, description: str) -> bool:
        """Check if a file exists"""
        import os
        exists = os.path.exists(filepath)

        if exists:
            self.results.append((description, True, f"✓ Found at {filepath}"))
        else:
            self.results.append((description, False, f"✗ Missing: {filepath}"))

        return exists

    def check_ml_models(self) -> bool:
        """Validate ML model implementations"""
        try:
            from RankingPredictor import SEORankingPredictor
            from FeatureEngineering import SEOFeatureEngineer

            # Test instantiation
            predictor = SEORankingPredictor(model_type='xgboost')
            engineer = SEOFeatureEngineer()

            self.results.append(("ML Models", True, "✓ RankingPredictor & FeatureEngineer"))
            return True
        except Exception as e:
            self.results.append(("ML Models", False, f"✗ Import failed: {str(e)}"))
            return False

    def print_results(self):
        """Print validation results"""
        print("\n" + "="*70)
        print("SEO AI MODEL - SETUP VALIDATION REPORT")
        print("="*70 + "\n")

        categories = {
            "Core ML Libraries": ["numpy", "pandas", "scikit-learn"],
            "Gradient Boosting": ["xgboost", "lightgbm"],
            "Model Tracking": ["mlflow", "joblib"],
            "Statistical": ["scipy"],
            "ML Models": ["ML Models"],
            "Configuration": ["requirements.txt", ".env.example"]
        }

        for category, items in categories.items():
            print(f"📦 {category}")
            print("-" * 70)

            for result in self.results:
                name, status, message = result
                if any(item in name for item in items):
                    status_icon = "✅" if status else "❌"
                    print(f"  {status_icon} {name:30s} {message}")

            print()

        # Summary
        total = len(self.results)
        passed = sum(1 for _, status, _ in self.results if status)
        failed = total - passed

        print("="*70)
        print(f"SUMMARY: {passed}/{total} checks passed")

        if failed == 0:
            print("🎉 All checks passed! Your SEO AI setup is ready.")
            print("\nNext steps:")
            print("  1. Configure API keys in .env")
            print("  2. Run database migrations")
            print("  3. Test with: python train_seo_model.py --test")
            return True
        else:
            print(f"⚠️  {failed} checks failed. Please fix the issues above.")
            print("\nTo install missing dependencies:")
            print("  pip install -r requirements.txt")
            return False


def main():
    """Run all validation checks"""
    validator = SetupValidator()

    print("\n🔍 Validating SEO AI Model setup...\n")

    # Check core dependencies
    validator.check_dependency("numpy", "1.24.0")
    validator.check_dependency("pandas", "2.0.0")
    validator.check_dependency("sklearn", "1.3.0")

    # Check gradient boosting libraries
    validator.check_dependency("xgboost", "2.0.0")
    validator.check_dependency("lightgbm", "4.0.0")

    # Check model tracking
    validator.check_dependency("mlflow", "2.8.0")
    validator.check_dependency("joblib", "1.3.0")

    # Check statistical libraries
    validator.check_dependency("scipy", "1.11.0")

    # Check ML model implementations
    validator.check_ml_models()

    # Check configuration files
    validator.check_file_exists("requirements.txt", "requirements.txt")
    validator.check_file_exists("../../../.env.example", ".env.example")

    # Print results
    success = validator.print_results()

    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
