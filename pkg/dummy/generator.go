package dummy

import (
	"crypto/sha256"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/brianvoe/gofakeit/v6"
)

// Item represents a dummy entity with 10 realistic fields
type Item struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	Status    string    `json:"status"`
	Phone     string    `json:"phone"`
	Avatar    string    `json:"avatar"`
	City      string    `json:"city"`
	Bio       string    `json:"bio"`
	CreatedAt time.Time `json:"created_at"`
}

// CorsMiddleware adds CORS headers for frontend integration
func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// GetFakerInstance returns a gofakeit Faker, seeded if requested
func GetFakerInstance(seedParam string) *gofakeit.Faker {
	if seedParam == "" {
		return gofakeit.New(time.Now().UnixNano())
	}

	if num, err := strconv.ParseInt(seedParam, 10, 64); err == nil {
		return gofakeit.New(num)
	}

	hash := sha256.Sum256([]byte(seedParam))
	seed := int64(binary.BigEndian.Uint64(hash[:8]))
	return gofakeit.New(seed)
}

// GenerateItems creates an array of N dummy items
func GenerateItems(faker *gofakeit.Faker, count int) []Item {
	statuses := []string{"active", "pending", "inactive", "suspended"}
	items := make([]Item, count)

	for i := 0; i < count; i++ {
		name := faker.Name()
		email := faker.Email()
		items[i] = Item{
			ID:        faker.UUID(),
			Name:      name,
			Email:     email,
			Role:      faker.JobTitle(),
			Status:    statuses[faker.Number(0, len(statuses)-1)],
			Phone:     faker.Phone(),
			Avatar:    fmt.Sprintf("https://api.dicebear.com/7.x/avataaars/svg?seed=%s", faker.Username()),
			City:      faker.City(),
			Bio:       faker.Sentence(8),
			CreatedAt: faker.DateRange(time.Now().AddDate(-1, 0, 0), time.Now()),
		}
	}

	return items
}

// HandleItems handles /api/items and /api/users
func HandleItems(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	countStr := query.Get("count")
	if countStr == "" {
		countStr = query.Get("limit")
	}
	if countStr == "" {
		countStr = query.Get("n")
	}

	count := 10 // default
	if countStr != "" {
		if parsed, err := strconv.Atoi(countStr); err == nil {
			count = parsed
		}
	}

	if count < 1 {
		count = 1
	} else if count > 1000 {
		count = 1000
	}

	if delayStr := query.Get("delay"); delayStr != "" {
		if delay, err := time.ParseDuration(delayStr); err == nil && delay > 0 && delay <= 5*time.Second {
			time.Sleep(delay)
		}
	}

	faker := GetFakerInstance(query.Get("seed"))
	items := GenerateItems(faker, count)

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(items); err != nil {
		http.Error(w, `{"error":"failed to encode response"}`, http.StatusInternalServerError)
	}
}

// HandleRoot returns API information and usage examples
func HandleRoot(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" && r.URL.Path != "" {
		http.NotFound(w, r)
		return
	}

	info := map[string]any{
		"message": "Welcome to the Free Dummy API!",
		"status":  "healthy",
		"endpoints": []map[string]string{
			{
				"path":        "/api/items",
				"method":      "GET",
				"description": "Returns a JSON array of N dummy objects with 10 fields",
			},
			{
				"path":        "/api/users",
				"method":      "GET",
				"description": "Alias for /api/items",
			},
			{
				"path":        "/health",
				"method":      "GET",
				"description": "Health check endpoint",
			},
		},
		"query_parameters": map[string]string{
			"count": "Number of items to return (1-1000, default: 10). Aliases: 'limit', 'n'",
			"seed":  "Optional seed (string or number) for deterministic, reproducible results",
			"delay": "Optional simulated network delay (e.g., '200ms', '1s')",
		},
		"example_urls": []string{
			"/api/items?count=5",
			"/api/users?count=25&seed=my-test-seed",
			"/api/items?count=10&delay=300ms",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(info)
}

// NewMux returns a configured http.ServeMux with all routes
func NewMux() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", HandleRoot)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	mux.HandleFunc("/api/items", HandleItems)
	mux.HandleFunc("/api/users", HandleItems)

	return CorsMiddleware(mux)
}
